import React, { useEffect, useState } from 'react';
import TopNav from '../components/TopNavigation';
import { FB_COL_USERS, FB_COL_USERS_LOG } from '../constants/Constants';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import Swal from 'sweetalert2';
import firebase from '../firebase';

import pic from '../assets/avatar_2x.png'
import { Spinner } from 'react-bootstrap';
import { IUser, IUserLog } from '../models/Index';

const Profile = () => {

  const [userData, setUserData] = useState<any>();
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<number | null>(0);
  const [mail, setMail] = useState("");
  const [profilePic, setProfilePic] = useState<any>(pic);
  const [isEditing, setIsEditing] = useState(false);
  const [providedPassword, setProvidedPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { currentUser }:any = useAuth();

  useEffect(()=>{
    window.scrollTo(0, 0);
    if(currentUser?.photoURL){
      setProfilePic(currentUser.photoURL);
    }
    document.getElementById("picture-input")?.addEventListener("change",(value)=>{triggerPictureInput(value)});
    getUserData();
  },[]);

  const swtoast = (icon:any, title:string) => {
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

  const getUserData = async () => {
    try{
        const userDoc = await firebase.firestore().collection(FB_COL_USERS).doc(currentUser?.uid).get();
        let userData:any = userDoc.data();
        setName(userData.displayName);
        setPhone(userData.phoneNumber);
        setMail(userData.email);
        setUserData(userData);
    }catch(ex){
        console.error(ex);
    }
  }

  const triggerPictureInput = (value:any) => {
    try{
      let file = value.target.files[0]; // upload the first file only
      (document.getElementById("picture-input") as any).value = "";//$("#picture-input").val("");
      if(!file){
        (document.getElementById("picture-input") as any).value = "";
        return false;
      }
      var regex = new RegExp("(.*?)\.(png|jpg|jpeg)$"); //allowed files
      if(!(regex.test(file.name.toLowerCase()))){
        alert("Allowed picture extensions are jpg, png, jpeg");
        (document.getElementById("picture-input") as any).value = "";
        return false;
      }
      updateProfileImage(file);
    }catch(ex){
      console.error(ex);
    }
  }

  const removeProfilePicture = async () => {
    try{
      let isConfirm = false;
      await Swal.fire({
        title: 'Are you sure?',
        text: "you want to remove your profile picture?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
      }).then((result) => {
        if (result.isConfirmed) {
          isConfirm = true;
        }
      });
      if(!isConfirm)
        return;
      setBtnDisabled(true);
      currentUser?.updateProfile({photoURL:null}).then(()=>{
          firebase.firestore().collection(FB_COL_USERS).doc(currentUser.uid).update({photoURL:""}).then(()=>{
              setProfilePic(pic);
              swtoast("success", "Your profile picture removed successfully");
              setBtnDisabled(false);
          }).catch((ex:any)=>{
            swtoast("error", "Something went wrong, try again");
            setBtnDisabled(false);
            console.error(ex);
          });
      }).catch((ex:any)=>{
          setBtnDisabled(false);
          swtoast("error", "Something went wrong, try again");
          console.error(ex);
      })
    }catch(ex){
      setBtnDisabled(false);
      swtoast("error", "Something went wrong, try again");
      console.error(ex);
    }
  }

  const updateProfileImage = (image:any) => {
    try{
        if(!image){
            alert("No file found, try again");
            return;
        }
        setBtnDisabled(true);
        let fileName = image.name;
        let fileNameArr = fileName.split(".");
        let extension = fileNameArr[fileNameArr.length - 1];

        // Create a root reference
        const storageRef = firebase.storage().ref();
        let metadata:any = {
            contentType : image.type,
            customMetadata:{
                userId : currentUser?.uid,
                userName : currentUser?.displayName
            }
        }
        storageRef.child("/images/pp/"+fileName).getDownloadURL().then((img)=>{
            storageRef.child("/images/pp/"+fileName).delete().then(()=>{
                handleImageUpload(storageRef,fileName,extension,metadata,image);
            }).catch((error:any)=>{
              setBtnDisabled(false);
              swtoast("error", "Something went wrong, try again");
              console.error(error);
            })
        }).catch((error:any)=>{
            if(error.code == "storage/object-not-found"){
                handleImageUpload(storageRef,fileName,extension,metadata,image);
            }else{
              setBtnDisabled(false);
              swtoast("error", "Something went wrong, try again");
              console.error(error);
            }
        });
    }catch(ex){
        setBtnDisabled(false);
        swtoast("error", "Something went wrong, try again");
        console.error(ex);
    }
}

  const handleImageUpload = (storageRef:any,fileName:string,extension:string,metadata:any,data:any) => {
    try{
        const uploadTask = storageRef.child("/images/pp/"+currentUser?.uid+"."+extension).put(data, metadata);
        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', function(snapshot:any){
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
        }, function(error:any) {
          setBtnDisabled(false);
          console.error(error);
          swtoast("error", "Something went wrong, try again");
            // Handle unsuccessful uploads
        }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            uploadTask.snapshot?.ref.getDownloadURL().then(function(downloadURL:any) {
                console.log('File available at', downloadURL);
                currentUser?.updateProfile({
                    photoURL:downloadURL
                }).then(()=>{
                    firebase.firestore().collection(FB_COL_USERS).doc(currentUser.uid).update({photoURL:downloadURL}).then(()=>{
                        setBtnDisabled(false);
                        setProfilePic(downloadURL);
                        swtoast("success", "Your profile picture updated successfully");
                    }).catch((ex:any)=>{
                        setBtnDisabled(false);
                        console.error(ex);
                        swtoast("error", "Something went wrong, try again");
                    });
                }).catch((ex:any)=>{
                  setBtnDisabled(false);
                  console.error(ex);
                  swtoast("error", "Something went wrong, try again");
                })
            });
        });
    }catch(ex){
      setBtnDisabled(false);
      console.error(ex);
      swtoast("error", "Something went wrong, try again");
    }
  }

  const updateProfile = async () => {
    try{
      if(!name){
          swtoast("warning", "Please enter your name");
          return;
      }
      if(!phone){
        swtoast("warning", "Please enter your phone no");
        return;
      }
      if(!mail){
        swtoast("warning", "Please enter your email");
        return;
      }
      let isValid = true;
      if(mail != userData.email){
        await firebase.auth().fetchSignInMethodsForEmail(mail).then((res)=>{
          if(res.length != 0){
            swtoast("warning", "Email already exists");
            isValid = false;
          }
        }).catch((error)=>{
          if(error.code.indexOf("auth/invalid-email") != -1){
            swtoast("warning", "Please enter valid mail");
            isValid = false;
          }else if(error.code.indexOf("auth/email-already-in-use") != -1){
            swtoast("warning", "Email already exists");
            isValid = false;
          }else{
            swtoast("warning", "Something went wrong, try again");
            isValid = false;
          }
        });
      }
      if(newPassword){
        if(newPassword.length < 6){
          swtoast("warning", "Password should have atleast 6 characters");
          isValid = false;
        }
      }
      if(!isValid)
        return;
      let isConfirm = false;
      await Swal.fire({
        title: 'Are you sure?',
        text: "you want to update your profile?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Update'
      }).then(async (result) => {
        if (result.isConfirmed) {
          if(newPassword || mail != userData.email){
            await (Swal as any).queue([{
              title: 'Confirm Password',
              confirmButtonText: 'Confirm',
              showCancelButton: true,
              input: 'text',
              inputValidator: async (value:any) => {
                  if (!value) {
                    return 'You need to provide current password!'
                  }else{
                    let isValid = false;
                    (Swal as any).enableLoading();
                    let text = "";
                    isValid = await new Promise((resolve) => {
                        var credential = firebase.auth.EmailAuthProvider.credential(
                          currentUser?.email as any,
                          value
                        );
                        currentUser?.reauthenticateWithCredential(credential).then(async ()=>{
                          resolve(true);
                        }).catch((ex:any)=>{
                          if(ex.code.indexOf("auth/wrong-password") != -1){
                            text = "Password is wrong";
                            resolve(false);
                          }else if(ex.code.indexOf("auth/too-many-requests") != -1){
                            text = "Too many attempts. try again later";
                            resolve(false);
                          }else{
                            text = "Something went wrong, try again";
                            resolve(false);
                          }
                        });
                    });
                    (Swal as any).disableLoading();
                    if(!isValid){
                        return text;
                    }
                  }
              },
              text: 'Type your current password to change email/password',
              showLoaderOnConfirm: true,
              preConfirm: () => {
                  isConfirm = true;
                }
            }]);
          }else{
            isConfirm = true;
          }
        }
      });
      if(!isConfirm)
        return;
      let metadata = {
        displayName : name,
        phoneNumber : phone
      }
      setBtnDisabled(true);
      if(name != userData.displayName || phone != userData.phoneNumber){
        await new Promise((resolve) => {
          currentUser?.updateProfile({displayName:name}).then(()=>{
            firebase.firestore().collection(FB_COL_USERS).doc(currentUser?.uid).update(metadata).then(async ()=>{
              if(name != userData.displayName){
                let ULog:IUserLog = {
                  userUID : currentUser?.uid,
                  name : userData.displayName,
                  type : "Update",
                  field : "displayName",
                  oldValue : userData.displayName,
                  newValue : name,
                  timestamp : new Date(),
                  createdTime : new Date().toString(),
                  createdBy : userData.displayName
                }
                await firebase.firestore().collection(FB_COL_USERS_LOG).doc().set(ULog);
              }  
              if(phone != userData.phoneNumber){
                let ULog:IUserLog = {
                  userUID : currentUser?.uid,
                  name : userData.displayName,
                  type : "Update",
                  field : "phoneNumber",
                  oldValue : userData.phoneNumber,
                  newValue : phone ? phone : "",
                  timestamp : new Date(),
                  createdTime : new Date().toString(),
                  createdBy : userData.displayName
                }
                await firebase.firestore().collection(FB_COL_USERS_LOG).doc().set(ULog);
              }
              resolve(true);
            }).catch((ex)=>{
              console.error(ex);
              resolve(false);
              //setBtnDisabled(false);
              //swtoast("error", "Something went wrong, try again");
            });
          }).catch((ex:any)=>{
            console.error(ex);
            //setBtnDisabled(false);
            resolve(false);
            //swtoast("error", "Something went wrong, try again");
          });
        });
      }

      //update email
      if(mail != userData.email){
        await new Promise((resolve) => {
          firebase.auth().currentUser?.updateEmail(mail).then(()=>{
            firebase.firestore().collection(FB_COL_USERS).doc(currentUser.uid).update({email:mail}).then(async ()=>{
                let ULog:IUserLog = {
                    userUID : currentUser.uid,
                    name : userData.displayName,
                    type : "Update",
                    field : "email",
                    oldValue : userData.email,
                    newValue : mail,
                    timestamp : new Date(),
                    createdTime : new Date().toString(),
                    createdBy : userData.displayName
                }
                await firebase.firestore().collection(FB_COL_USERS_LOG).doc().set(ULog);
                resolve(true);
                // Alert.alert("Success","Email updated successfully. Please login again",[{text:'Login',onPress:()=>{
                    
                // }}]);
            });
          }).catch((error)=>{
            console.error(error);
            resolve(false);
          });
        });
      }

      //update password
      if(newPassword){
        await new Promise((resolve) => {
          firebase.auth().currentUser?.updatePassword(newPassword).then(async ()=>{
            let ULog:IUserLog = {
                userUID : currentUser.uid,
                name : userData.displayName,
                type : "Update",
                field : "Password",
                oldValue : "......",
                newValue : "......",
                timestamp : new Date(),
                createdTime : new Date().toString(),
                createdBy : userData.displayName
            }
            await firebase.firestore().collection(FB_COL_USERS_LOG).doc().set(ULog);
            resolve(true);
            // Alert.alert("Success","Password updated successfully. Please login again",[{text:'Login',onPress:()=>{
                
            // }}]);
          }).catch((error)=>{
            console.error(error);
            resolve(false);
          });
        });
      }
      setBtnDisabled(false);
      setIsEditing(false);
      if(newPassword || mail != userData.email){
        Swal.fire({
          title: 'Login Required',
          text: "Please login again",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Login'
        }).then(() => {
          firebase.auth().signOut();
        })
      }else{
        swtoast("success", "Profile updated successfully");
        getUserData();
      }
    }catch(ex){
      setBtnDisabled(false);
      swtoast("error", "Something went wrong, try again");
    }
  }

  return(
        <div id="wrapper">
         <div id="content-wrapper" className="d-flex flex-column">
             <TopNav></TopNav>
             {/* Begin Page Content */}
             <div className="container-fluid" style={{paddingTop: '4.5rem'}}>
                <div className="main-body">
                  <div className="row gutters-sm">
                    <div className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex flex-column align-items-center text-center">
                            <img src={profilePic} alt="Admin" className="rounded-circle" width={150} />
                            <div className="mt-3">
                              <h4 style={{fontWeight:'bold',color:'black'}}>{userData ? userData.displayName.toUpperCase() : ""}</h4>
                              <p className="text-secondary mb-1">{userData ? userData.email : ""}</p>
                              <p className="text-muted font-size-sm">{userData ? userData.isAdmin ? "Admin" : "User" : ""}</p>
                              <button className="btn btn-outline-danger mr-4" disabled={btnDisabled} onClick={() => removeProfilePicture()}> Delete Picture</button>
                              <button className="btn btn-outline-primary" disabled={btnDisabled} onClick={() => {
                                document.getElementById("picture-input")?.click();
                              }}>Edit Picture</button>
                              <input type="file" accept="image/*" id="picture-input" hidden={true}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="card mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Name</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              <input type="text" value={name ? name.toUpperCase() : ""} onChange={(e) => setName(e.target.value)} placeholder="name" hidden={!isEditing} className="form-control"/>
                              <span hidden={isEditing}>{userData ? userData.displayName.toUpperCase() : ""}</span>
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Phone</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              <input type="text" value={phone ? phone : ""} minLength={8} maxLength={15} onChange={(e) => setPhone(e.target.value ? parseInt(e.target.value) : null)} placeholder="phone no" hidden={!isEditing} className="form-control"/>
                              <span hidden={isEditing}>{userData ? userData.phoneNumber : ""}</span>
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Email</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              <input type="text" value={mail ? mail : ""} onChange={(e) => setMail(e.target.value)} placeholder="email address" hidden={!isEditing} className="form-control"/>
                              <span hidden={isEditing}>{userData ? userData.email : ""}</span>
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Password</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              <input type="password" value={newPassword} placeholder="new password" onChange={(e) => setNewPassword(e.target.value)} hidden={!isEditing} className="form-control"/>
                              <span hidden={isEditing}>●●●●●●●●●●</span>
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Type</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                             {userData ? userData.isAdmin ? "Admin" : "User" : ""}
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Created Date</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              {userData ? moment(userData.metadata.creationTime).format("DD-MMM-YYYY hh:mm:ss") : ""}
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Last Login</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              {userData ? moment(currentUser?.metadata.lastSignInTime).format("DD-MMM-YYYY hh:mm:ss") : ""}
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">Account ID</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              {userData ? userData.linkId : ""}
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-3">
                              <h6 className="mb-0">User ID</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                              {userData ? userData.uid : ""}
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-sm-12">
                            <button className="btn btn-primary float-right" hidden={isEditing} onClick={() => setIsEditing(true)} disabled={btnDisabled}>Edit Profile</button>
                            <button className="btn btn-primary float-right" hidden={!isEditing} disabled={btnDisabled} onClick={() => updateProfile()}>Save Profile</button>
                            <button className="btn btn-danger float-right" hidden={!isEditing} onClick={() => setIsEditing(false)} disabled={btnDisabled} style={{marginRight:10}}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             {/* /.container-fluid */}
         </div>
         {/* End of Content Wrapper */}
       </div>
     );
}

export default Profile;