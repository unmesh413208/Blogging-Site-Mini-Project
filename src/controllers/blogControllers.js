const blogModel = require("../models/blogModel")
// const authorModel = require("../models/authorModel")
const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId
const jwt = require("jsonwebtoken")

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const createBlog = async function (req, res) {
    try {

        // storing the data from body in object format in a variable
        let body = req.body 

        // adding a new kew value pair {idPublished:true} to the enterd object because on new blog creation it should get published
        body.isPublished = true
        
        // creating a new document using the conditions inside the 'body' object
        let authorData = await blogModel.create(body)
        return res.status(201).send({ status: true, data: authorData })
    }
    catch (err) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })

    }
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const getBlogs = async function (req, res) {
    try {
        // stored all the data from query params in a variable
        let data = req.query
        let authorId = data.authorId // store enterd authorId in a variable



        if ("tags" in data) {
            tagsArr = data.tags.trim().split(",").map(tag => tag.trim())
            data.tags = { $all: tagsArr }
        }
        if ("subcategory" in data) {
            subCatArr = data.subcategory.trim().split(",").map(sbCat => sbCat.trim())
            data['subcategory'] = { $all: subCatArr }
        }


        //check if authorId key is enterd in filter and if its is a valid objectid
        if (("authorId" in data) && (!ObjectId.isValid(authorId))) {
            return res.status(400).send({ status: false, msg: "Bad Request. AuthorId invalid" })
        }
        // adding two new kew value pair {isDelete:false, idPublished:true} to the enterd object (data) 
        //because the blog requested by user shouldnot be deleted and should be get created by some author
        data.isDeleted = false
        data.isPublished = true
        // finding the blog through the enterd condition and newly updated condition
        let savedBlogs = await blogModel.find(data).populate("authorId") //find return array of object
        // check if condition entered in the postman/filter doesnot match any document
        if (savedBlogs.length == 0) {
            return res.status(404).send({ status: false, msg: "Resource Not found. Please try another filter" })
        } 
        // if data found in DB
        return res.status(200).send({ status: true,returned_document: savedBlogs.length ,data: savedBlogs })
        
    }
    catch (err) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })

    }

}



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>




const updateBlog = async function (req, res) {
    try {
            // Stores the blog id data recieved in params in to a new variable
            let enteredBlogId = req.params.blogId
            let publishDate = moment().format('YYYY-MM-DD h:mm:ss') //sets moment.js for publishAt date
            //DB call for users condition
            let updateData = await blogModel.findByIdAndUpdate(enteredBlogId, {
                title: req.body.title, body: req.body.body,
                $addToSet: { tags: req.body.tags, subcategory: req.body.subcategory }, isPublished: true, publishedAt: publishDate
            }, { new: true }).populate("authorId")
            return res.status(200).send({ status: true, data: updateData })
        
    }
     catch (err) {
        return res.status(500).send({ msg: "Serverside Errors. Please try again later", error: err.message })

    }
}



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>




const deleteBlogId = async function (req, res) {
    try {
     
            // Stores the blog id recieved in params in to a new variable
            let enteredBlogId = req.params.blogId
            let deleteDate = moment().format('YYYY-MM-DD h:mm:ss')  //sets moment.js time when deleted data in future DB call
            //DB call for users condition
            await blogModel.findOneAndUpdate({ _id: enteredBlogId }, { isDeleted: true, deletedAt: deleteDate },
                { new: true })
            return res.status(200).send({ status: true, msg: "Blog successfully deleted" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const deleteBlogIdAndQuery = async function(req,res){

    try{
        let data = req.query
        let deleteDate = moment().format('YYYY-MM-DD h:mm:ss')  //sets moment.js time when deleted data in future DB call

         let token = req.headers["x-Api-key"];
        if (!token) token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "bidipta-jiyalal-unmesh");
         
        let userLoggedIn = decodedToken.userId
        //this will add an key-value pair {authorId: userLoggedIn} to the query data
        data.authorId = userLoggedIn


        if ("tags" in data) {
            tagsArr = data.tags.trim().split(",").map(tag => tag.trim())
            data.tags = { $all: tagsArr }
        }
        if ("subcategory" in data) {
            subCatArr = data.subcategory.trim().split(",").map(sbCat => sbCat.trim())
            data['subcategory'] = { $all: subCatArr }
        }

        let updateData = await blogModel.updateMany(data, {$set: {isDeleted : true , deletedAt: deleteDate}})
        if(updateData.matchedCount==0){  //if combination of filtered documents doesnot exist
            return res.status(404).send({ status: false, msg: "Page/Resource not found. Blog Document doesnot exist for this filter"})
        }else{
            return res.status(201).send({status:true,msg: "Blog successfully deleted", data: updateData})
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).send({status:false, msg:err.message})
    }
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlog = updateBlog
module.exports.deleteBlogId = deleteBlogId
module.exports.deleteBlogIdAndQuery = deleteBlogIdAndQuery