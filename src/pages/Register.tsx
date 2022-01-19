import React from "react";
import '../styles/Register.css';
import firebase from '../firebase';
import Swal from 'sweetalert2';
import icon from '../assets/earth.png';
import { IUser } from "../models/Index";
import { FB_COL_USERS } from "../constants/Constants";
import { Link, Redirect } from "react-router-dom";

interface IRegisterState{
    name : string
    email : string
    pass : string
    conpass : string
    mobileNo : string
    btndisable : boolean
    redirect : boolean
}

class Registration extends React.Component<{},IRegisterState>{
  constructor(props:any){
    super(props);
    this.state = {
        name : "",
        email : "",
        pass : "",
        conpass : "",
        mobileNo : "",
        btndisable : false,
        redirect : false
    }
  }

  componentDidMount(){
    window.scrollTo(0, 0);
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

  fieldValidation = async (level:string) => {
    let obj = {
        isValid : true,
        icon : "warning",
        text : ""
    };
    let fields = ["_fn","_mail","_phone","_pass","_conpass"];
    let focusField, count = 0;
    fields.forEach((field)=>{
        let input:any = document.getElementById(level+field);
        input.classList.remove("border-danger");
        if(!input.value){
            input.classList.add("border-danger");
            obj.isValid = false;
            obj.text ="Please fill all the mandatory fields";
            if(count === 0){
                focusField = input;
                count++;
            }
        }
    });
    if(obj.isValid){
        let pass:any = document.getElementById(level+"_pass");
        let conpass:any = document.getElementById(level+"_conpass");
        if(pass.value !== conpass.value){
            pass.classList.add("border-danger");
            conpass.classList.add("border-danger");
            focusField = conpass;
            obj.isValid = false;
            obj.text = "Password doesn't match";
        }
    }
    if(!obj.isValid){
        focusField.focus();
        this.swtoast(obj.icon, obj.text);
    }
    return obj.isValid;
  }

  onChange = (e:any, type:string) => {
    if(type == "mobile"){
      const re = /^[0-9\b]+$/;
      if (e.target.value === '' || re.test(e.target.value)) {
        this.setState({mobileNo: e.target.value})
      }
    }else{
      
    }
  }

  registerUser = async (event:any, level:string) => {
    let _this = this;
    event.preventDefault();
    const fieldValidation = await this.fieldValidation(level);
    if(!fieldValidation){
        return false;
    }
    this.setState({btndisable:true});
    firebase.auth().createUserWithEmailAndPassword(this.state.email,this.state.pass).then(()=>{
      var currentUser:any = firebase.auth().currentUser;
        if(currentUser) {
          currentUser.updateProfile({
          displayName: _this.state.name
        }).then(async function() {
          let metadata = {
            creationTime : currentUser?.metadata.creationTime,
            lastSignInTime : currentUser?.metadata.lastSignInTime
          }
          let userMetadata : IUser = {
            uid : currentUser.uid,
            displayName : _this.state.name,
            email : currentUser.email,
            emailVerified : false,
            phoneNumber : parseInt(_this.state.mobileNo),
            isAdmin : false,
            isVerified : false,
            isRejected : false,
            metadata : metadata
          }
          await firebase.firestore().collection(FB_COL_USERS).doc(currentUser.uid).set(userMetadata);
          firebase.auth().signOut().then(() => {
            _this.setState({btndisable:false});
            Swal.fire({
              title: 'Success',
              text: "Now you are a part of our organization",
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Login'
            }).then((result) => {
              if (result.value) {
              _this.setState({redirect:true});
              }
            })
          });
        }).catch(function(err:any) {
          // An error happened.
          _this.setState({btndisable:false});
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: '<a href>Why do I have this issue?</a>'
          })
          firebase.auth().currentUser?.delete();
        });
      }
    }).catch((error:any)=>{
      this.setState({btndisable:false});
      if(error.code === "auth/invalid-email"){
        let mail = document.getElementById(level+"_mail");
        mail?.classList.add("border-danger");
        mail?.focus();
        _this.swtoast("warning", "Please enter valid mail");
        return;
      }else if(error.code === "auth/weak-password"){
        let pass = document.getElementById(level+"_pass");
        pass?.classList.add("border-danger");
        pass?.focus();
        _this.swtoast("warning", "Password should have atleast 6 characters");
        return;
      }else if(error.code == "auth/email-already-in-use"){
        let mail = document.getElementById(level+"_mail");
        mail?.classList.add("border-danger");
        mail?.focus();
        _this.swtoast("warning", "Email already exists");
        return;
      }else{
        console.error(error);
        _this.swtoast("warning", "Something went wrong. Please try again");
        return;
      }
    });
  }

  render(){
    const state = this.state;
    return(
      <React.Fragment>
        <div className="container-fluid register">
                <div className="row">
                    <div className="col-md-3 register-left">
                        <img src={icon}/>{/* "https://image.ibb.co/n7oTvU/logo_white.png" alt=""/> */}
                        <h3>Welcome</h3>
                        <p>You are 30 seconds away from accessing our organization!</p>
                        <Link to="/login">
                        <button type="submit" name="" disabled={state.btndisable}>Login</button><br/>
                        </Link>
                    </div>
                    <div className="col-md-9 register-right">
                    <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <h3 className="register-heading">Register to Thunder Organization</h3>
                                <div className="row register-form">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input type="text" className="form-control" id="user_fn" placeholder="Your Name" value={state.name} onChange={(e)=>this.setState({name:e.target.value})}/>
                                        </div>
                                        <div className="form-group">
                                            <input type="email" className="form-control" id="user_mail" placeholder="Your Email"  value={state.email} onChange={(e)=>this.setState({email:e.target.value})}/>
                                        </div>
                                        <div className="form-group">
                                            <input type="text" minLength={8} maxLength={15} name="txtEmpPhone" id="user_phone" className="form-control" placeholder="Your Mobile No" value={state.mobileNo} onChange={(e) => this.onChange(e,"mobile")}/>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <input type="password" className="form-control" id="user_pass" placeholder="Password"  value={state.pass} onChange={(e)=>this.setState({pass:e.target.value})}/>
                                        </div>
                                        <div className="form-group">
                                            <input type="password" className="form-control" id="user_conpass" placeholder="Confirm Password"  value={state.conpass} onChange={(e)=>this.setState({conpass:e.target.value})}/>
                                        </div>
                                        <p className="terms-and-conditions">By clicking Sign Up, you agree to our <a href="#" id="terms-link" rel="nofollow">Terms</a>, <a href="#" id="privacy-link" rel="nofollow">Data Policy</a> and <a href="#" id="cookie-use-link"  rel="nofollow">Cookie Policy</a>. You may receive SMS notifications from us and can opt out at any time.</p>
                                        {
                                          state.btndisable ? <button className="btnRegister" type="button" disabled>
                                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                          Registering...
                                          </button> : <input type="submit" className="btnRegister"  value="Register" onClick={(event)=>this.registerUser(event,"user")} disabled={state.btndisable}/>
                                        }                                      
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
              </div>
              {(this.state.redirect) ? <Redirect to={{pathname:"/login"}} push></Redirect> : null}
      </React.Fragment>
    );
  };
}

export default Registration;