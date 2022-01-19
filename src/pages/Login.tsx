import React from 'react';
import "../styles/Login.css";
import Swal from 'sweetalert2';
import firebase from '../firebase';

import avatar from '../assets/avatar_2x.png';
import icon from '../assets/earth.png';
import { FB_COL_USERS } from '../constants/Constants';
import { Link, Redirect } from 'react-router-dom';

interface ILoginState {
    email : string
    password : string
    btnDisabled : boolean
    isLoggedIn : boolean
    isMounted : boolean
}

class Login extends React.Component<{},ILoginState> {
    constructor(props:any) {
        super(props);
        this.state = {
            email : "",
            password : "",
            isLoggedIn : false,
            btnDisabled : false,
            isMounted : false
        };
    }

    componentDidMount(){
        let _this = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user && !_this.state.isMounted) {
              // User is signed in.
              _this.setState({isLoggedIn:true});
            } else {
              // No user is signed in.
            }
        });
        this.setState({isMounted : true});

    }

    handleInputs = (event:any,input:string) => {
        try{
            if(input == "email"){
                this.setState({email:event.target.value});
            }else if(input == "pass"){
                this.setState({password:event.target.value})
            }
        }catch(ex){
            console.error(ex);
        }
    }

    fieldValidation = () => {
        let isValid = true;
        let fields = ["inputEmailUserName","inputPassword"];
        let focusField:any, count = 0;
        fields.forEach((field)=>{
            let input:any = document.getElementById(field);
            input.classList.remove("border-danger");
            if(!input.value){
                input.classList.add("border-danger");
                isValid = false;
                if(count === 0){
                    focusField = input;
                    count++;
                }
            }
        });
        if(!isValid){
            focusField.focus();
            this.swtoast("warning", "Email/Password should be mandatory")
        }
        return isValid
    }

    swtoast = (icon:any, title:string) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            onOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          })
          
        Toast.fire({
            icon: icon,
            title: title
        });
    }

    signin = async (event:any) => {
        try{
            event.preventDefault();
            const fieldvalidation = this.fieldValidation();
            if(!fieldvalidation){
                return false;
            }
            this.setState({btnDisabled : true});
            const validationResult:any = await this.validateAccount();
            if(!validationResult.isValid){
                this.setState({btnDisabled : false});
                Swal.fire({
                    icon: 'error',
                    title: validationResult.title,
                    text: validationResult.text,
                    footer: "<a href='#' title='"+validationResult.information+"'>Why do I have this issue?</a>"
                })
            }else{
                let userDoc = await firebase.firestore().collection(FB_COL_USERS).doc(firebase.auth().currentUser?.uid).get();
                let userData:any = userDoc.data();
                this.setState({btnDisabled : false});
                if(userData.isVerified){
                    //navigation.replace('DrawerNavigatorRoutes');
                    if(userData.isAdmin){
                        firebase.auth().signOut();
                        Swal.fire({
                            icon: 'error',
                            title: 'Access Denied',
                            text: "Currently admin can't access this site.",
                            footer: '<a href>Why do I have this issue?</a>'
                          })
                    }else{
                        this.setState({isLoggedIn:true});
                        this.swtoast("success", "Welcome, "+firebase.auth().currentUser?.displayName);
                    }
                }else if(userData.isRejected){
                    firebase.auth().signOut();
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Your id is disabled. Please contact your admin.',
                        footer: '<a href>Why do I have this issue?</a>'
                      })
                }else{
                    firebase.auth().signOut();
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Please contact your admin to get approval of your account.',
                        footer: '<a href>Why do I have this issue?</a>'
                      })
                }
            }
        }catch(ex){
            this.setState({btnDisabled : false});
            console.error(ex);
        }
    }

    forgotPassword = (e:any) => {
        e.preventDefault();
        (Swal as any).queue([{
        title: 'Reset Password',
        confirmButtonText: 'Confirm',
        showCancelButton: true,
        input: 'text',
        inputValidator: async (value:any) => {
            if (!value) {
              return 'You need to write something!'
            }else{
              let isValid = false;
              (Swal as any).enableLoading();
              let text = "";
              isValid = await new Promise((resolve) => {
                firebase.auth().sendPasswordResetEmail(value).then(()=>{
                    resolve(true);
                }).catch((error)=>{
                    if(error.code == "auth/invalid-email"){
                        text = "Please enter a valid email";
                        resolve(false);
                    }else if(error.code == "auth/user-not-found"){
                        text = "Please register your account first";
                        resolve(false);
                    }else{
                        text = "Something went wrong, try again";
                        resolve(false);
                    }
                })
              });
              (Swal as any).disableLoading();
              if(!isValid){
                  return text;
              }
            }
        },
        text: 'Please type your registered mail id',
        showLoaderOnConfirm: true,
        preConfirm: async (data:any) => {
            Swal.fire({
                icon: 'success',
                html: 'Please check your mail to reset your password',
                footer: "<a href='#' style='color:red'>Don't share your password to anyone</a>"
              })
          }
        }])
    }

    validateAccount = () => {
        let obj = {isValid:false,title:"Oops...",text:"This account is not registered",buttontext:"Register",information:"Your account is not registered. Please click the Register link to sign in"};
        return new Promise((resolve) => {
            firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password).then(()=>{
                obj = {isValid:true,title:"Success",text:"Login success",buttontext:"",information:""};
                resolve(obj);
            }).catch((error) => {
                if(error.code == "auth/user-not-found"){
                    resolve(obj);
                }else if(error.code == "auth/invalid-email"){
                    obj = {isValid:false,title:"Oops...",text:"Please enter a valid email",buttontext:"Forgot password",information:"Your email id is Incorrect. Please check the email"};
                    resolve(obj);
                }else if(error.code == "auth/wrong-password"){
                    obj = {isValid:false,title:"Oops...",text:"The password is incorrect",buttontext:"Forgot password",information:"Your account password is Incorrect. Please click the Forgot the password link to change password"};
                    resolve(obj);
                }else if(error.code == "auth/user-disabled"){
                    obj = {isValid:false,title:"Oops...",text:"Your account is disabled",buttontext:"Forgot password",information:"Please contact your admin to open your account"};
                    resolve(obj);
                }else if(error.code == "auth/too-many-requests"){
                    obj = {isValid:false,title:"Oops...",text:"Too many attempts",buttontext:"Forgot password",information:"Please try again later"};
                    resolve(obj);
                }else{
                    obj = {isValid:false,title:"Oops...",text:"Something went wrong",buttontext:"Forgot password",information:"Try again later"};
                    resolve(obj);
                }
            });
        });
    }

    render(){
        const {email, password} = this.state;
        return(
            <div style={{textAlign:"center"}}>
             <div className="sidenav">
                <div className="login-main-text">
                    <img src={icon}/>
                    <h2>Thunder Organization</h2>
                    <p>Login or register from here to access.</p>
                </div>
            </div>
            <div className="main login-main">
              <div className="col-md-6 col-sm-12 login-container">
                <div className="card card-container">
                    {/*</div><img className="profile-img-card" src="//lh3.googleusercontent.com/-6V8xOA6M7BA/AAAAAAAAAAI/AAAAAAAAAAA/rzlHcD0KYwo/photo.jpg?sz=120" alt="" /> */}
                    <img id="profile-img" className="profile-img-card" alt="profile-img" src={avatar}/>
                    <p id="profile-name" className="profile-name-card"></p>
                    <form className="form-signin">
                        <span id="reauth-email" className="reauth-email"></span>
                        <input type="email" id="inputEmailUserName" className="form-control" placeholder="Email address" onChange={(e)=>{this.handleInputs(e,"email")}} value={email}/>
                        <input type="password" id="inputPassword" className="form-control" placeholder="Password" onChange={(e)=>{this.handleInputs(e,"pass")}} value={password}/>
                        <div id="remember" className="checkbox">
                            <label>
                                <input type="checkbox" value="remember-me"/> Remember me
                            </label>
                        </div>
                        {
                            this.state.btnDisabled ? <button className="btn btn-lg btn-primary btn-block btn-signin" type="button" disabled>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Signing...
                            </button> : <button className="btn btn-lg btn-primary btn-block btn-signin" type="submit" onClick={this.signin.bind(this)} disabled={this.state.btnDisabled}>Sign in</button>
                        } 
                    </form>
                    {/* <a href="#" className="Register-account" onClick={this.skipSignIn.bind(this)}>
                       Skip Login
                    </a> */}
                    <a href="#" className="forgot-password" onClick={(e)=>{this.forgotPassword(e)}}>
                        Forgot the password? Reset
                    </a>
                    <Link to="/registration" className="Register-account" >
                        New Here? Register
                    </Link>

                    {/* <Link to="/registration" className="Register-account">New user? Register</Link> */}
                  </div>
                </div>
            </div>
            {(this.state.isLoggedIn) ? <Redirect to={{pathname:"/"}} push></Redirect> : null}
        </div>
        );
    }
}

export default Login;