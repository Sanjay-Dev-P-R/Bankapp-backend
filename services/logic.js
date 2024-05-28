// import db
const {response} = require('express');
const db=require('./db')

// import jsonweb token
const jwt=require('jsonwebtoken')

// logic for register
const register=(username,acno,password)=>{
    return db.User.findOne({acno}).then((response)=>{
        console.log(response);
        if(response){
            return {
                statusCode:401,
                message:"Acno is already registered"
            }
        }
        else{
            const newUser=new db.User({
                username,
                acno,
                password,
                balance:2000,
                transactions:[]
            }
            )
            // to store the new user in the database
            newUser.save()
            // response send back to the client
            return{
                statusCode: 200,
                message:"Registration successful"
            } 
        }
    })
}

// logic for login
const login=(acno,password)=>{
    return db.User.findOne({acno,password}).then((response)=>{
        if(response){
            // token generate
            const token =jwt.sign({
                loginAcno:acno
            
            },'superkey2023')
            return{
                statusCode:200,
                message:"Login Successful",
                currentUser:response.username,//current user sent to frontend
                balance:response.balance,//balance of current user
                token,
                currentAcno:acno
            }
        }
        // if acno and password not present in db
        else{
            return{
                statusCode:401,
                message:"Invalid Login"
            }

        }
    })
}

// logic gor getting balance
const getBalance =(acno)=>{
    return db.User.findOne({acno}).then((result)=>{
        if(result){
            return{
                statusCode:200,
                balance:result.balance
            }
        }
        else{
            return{
                statusCode:401,
                message:"Invalid acno"
            }
        }
    })
}


// fund transfer
const fundTransfer=(fromAcno,frompswd,toAcno,amt)=>{

    // convert amt to a number 
    let amount = parseInt(amt)
    // check fromAcno and frompswd in mongodb
    return db.User.findOne({acno:fromAcno,password:frompswd}).then((debit)=>{
        if(debit){
            // check acno in mongo db
            return db.User.findOne({acno:toAcno}).then((credit)=>{
                // fund transfer
                if(credit){
                    if(debit.balance>=amount){
                        debit.balance-=amount
                        debit.transactions.push({
                            type:'Debit',
                            amount,
                            fromAcno,
                            toAcno
                        })
                    }
                    else{
                        return{
                            statusCode:400,
                            message:"Insufficient fund"
                        }
            
                    }
                    // save changes into database
                    debit.save()

                    credit.balance+=amount
                        credit.transactions.push({
                            type:'credit',
                            amount,
                            fromAcno,
                            toAcno
                        })
                        // save changes to database
                        credit.save()
                        // send response back to client
                        return{
                            statusCode:200,
                            message:'Fund transfer successful....'
                        }
                }
                else{
                    return{
                        statusCode:400,
                        message:"Invalid Debit Details"
                    }
        
                }
                
            })
        }
        else{
            return{
                statusCode:400,
                message:"Invalid Debit Details"
            }

        }
    })
}

// transaction history 
const transactionHistory=(acno)=>{
// check acno present in mongodb
return db.User.findOne({acno}).then((result)=>{
    if(result){
        return{
            statusCode:200,
            transactions:result.transactions
        }
    }
    else{
        return{
            statusCode:401,
            message:"Invalid Data"
        }
    }
})
}

// delete Account
const deleteAccount=(acno)=>{

    return db.User.deleteOne({acno}).then((result)=>{
        return{
            statusCode: 200,
            message:"Account Deleted Successfully"
        }
     })
}

module.exports={
    register,
    login,
    getBalance,
    fundTransfer,
    transactionHistory,
    deleteAccount,
};