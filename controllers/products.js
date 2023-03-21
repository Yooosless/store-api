const Product=require('../models/product')

const getAllProductsStatic= async(req,res)=>{
    const Products=await Product.find({price:{$gt:30}}).sort('price').select('name price').limit(10)
    res.status(200).json({Products,nbHits:Products.length})
}

const getAllProducts=async (req,res)=>{
    const{featured,company,name,sort,fields,numericFilters}=req.query
    const queryObject={}
    if(featured){
        queryObject.featured=featured==='true'?true:false
    }
    if(company){
        queryObject.company=company
    }
    if(name){
        queryObject.name={$regex:name,$options:'i'}
    }

    if(numericFilters){
        const operatorsMap={
            '>':'$gt',
            '<':'$lt',
            '<=':'$lte',
            '>=':'$gte',
            '=':'$e',
        }
        const regEx=/\b(<|>|<=|>=|=)\b/g
        let filters=numericFilters.replace(regEx,(match)=>`-${operatorsMap[match]}-`)
        
        const options=['price','rating'];
        filters=filters.split(',').forEach((item)=>{
            const[field,operator,value]=item.split('-')
            if(options.includes(field)){
                queryObject[field]={[operator]:Number(value)}
            }
        })
    }
   
    let result=Product.find(queryObject)
    if(sort){
        const sortList=sort.split(',').join(' ');
        result=result.sort(sortList)
    }
    else{
        result=result.sort('createAt')
    }

    if(fields){
        const fieldsList=fields.split(',').join(' ')
        result=result.select(fieldsList)
    }
    const page=Number(req.query.page)||1
    const limit=Number(req.query.limit)||10
    const skip=(page-1)*limit
    result=result.skip(skip).limit(limit)

    const Products= await result
    res.status(200).json({Products,Total_Records:Products.length})
}


module.exports={
    getAllProductsStatic,
    getAllProducts,
}