package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rachelyeohm/open-jio/go-crud/helper"
	"github.com/rachelyeohm/open-jio/go-crud/initializers"
	"github.com/rachelyeohm/open-jio/go-crud/middleware"
	"github.com/rachelyeohm/open-jio/go-crud/models"
	"golang.org/x/crypto/bcrypt"
)

//LOGIN AND REGISTER
func Login(c *gin.Context) {
	var input models.User
	fmt.Printf("logging in")
	err := c.ShouldBindJSON(&input);
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error" : err.Error()})
		return 
	}
	

	//check if username exists
	user, err := FindUserByUsername(input.Username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error" : err.Error()})
		return 
	}

	//then validate password
	err = user.ValidatePassword(input.Password)
	fmt.Printf(input.Password)
	if err != nil {
		
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error() + input.Username +  "test" + input.Password})
        return
	}

	//then generate JWT
	jwt, err := helper.GenerateJWT(user)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
	//generate cookie
	middleware.SetCookie(c, jwt)

	// c.String(http.StatusOK,strconv.FormatUint(uint64(user.ID), 10))
    c.JSON(http.StatusOK, gin.H{"jwt": jwt})
}

func Register(c *gin.Context) {
    var input models.User

	err := c.ShouldBindJSON(&input);  // binds input to context, returns possible error
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
	}
	
	//encrypts the passwords
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
	//creates the user
    user := models.User{
        Username: input.Username,
        Password: string(hashedPassword),
		Email: input.Email,
		Events: []models.Event{},
    }

	//check if user or email exists 
	if FindWhetherUserExists(user.Username) {
		c.JSON(http.StatusNotAcceptable, gin.H{"error" : "user exists"})
		return 
	}

	if FindWhetherEmailExists(user.Email) {
		c.JSON(http.StatusNotAcceptable, gin.H{"error" : "email exists"})
		return 
	}

	//puts it in the database	
    savedUser, err := user.Save()

    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"user": savedUser})
}

//Helper functions (dont know where to put this)

func FindUserByUsername(username string) (models.User, error) {
    var user models.User
    err := initializers.DB.Where("Username=?", username).Find(&user).Error
    if err != nil {
        return models.User{}, err
    }
    return user, nil
}


func FindUserByEmail(email string) (models.User, error) {
    var user models.User
    err := initializers.DB.Where("Email=?", email).Find(&user).Error
    if err != nil {
        return models.User{}, err
    }
    return user, nil
}

func FindWhetherUserExists(username string ) (bool) {
	//return true if user exists
    result := initializers.DB.Where("Username=?", username).Find(&models.User{})
    return result.RowsAffected != 0
}

func FindWhetherEmailExists(email string ) (bool) {
	//return true if email exists
    result := initializers.DB.Where("Email=?", email).Find(&models.User{})
    return result.RowsAffected != 0
}




//BASIC CRUD STUFF (i didnt wanna delete it yet)
//Create
func CreateUser(c *gin.Context) {
	//get data from the request body
	var body struct {
		Username string
		Password string
		Email string
	}

	c.Bind(&body)

	//create the user object (hardcoded for now)
	user := models.User{Username: body.Username, 
		Password: body.Password, 
		Email: body.Email, 
		Events : []models.Event{}}

	newUser, err := user.Save()

	if err != nil {
		c.Status(400)
		return
	}

	//return it
	c.JSON(200, gin.H{
		"user" : newUser,
	})

}

//Read
func FetchUsers(c *gin.Context) {
	var users []models.User
	initializers.DB.Find(&users)
	c.JSON(200, gin.H{
		"users" : users,
	})

}

func FetchSingleUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")
	initializers.DB.First(&user, id)
	c.JSON(200, gin.H{
		"user" : user,
	})

}

//Update
func UpdateUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")
	var body struct {
		Username string
		Password string
		Email string
	}
	c.Bind(&body)
	initializers.DB.First(&user, id)
	initializers.DB.Model(&user).Updates(models.User{Username: body.Username, 
						Password: body.Password, Email: body.Email})
	c.JSON(200, gin.H{
		"user" : user,
	})

}

//Delete
func DeleteUser(c *gin.Context) {

	//get id off the url
	id := c.Param("id")

	//find user to update
	initializers.DB.Delete(&models.User{}, id)

	//respond
	c.Status(200)

}

