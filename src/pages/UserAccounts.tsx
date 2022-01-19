import React, { useEffect } from 'react';
import TopNav from '../components/TopNavigation';
import $ from 'jquery';
import moment from 'moment';
import 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css';
import firebase from '../firebase';
import { Table } from 'react-bootstrap';
import { FB_COL_USER_ACCOUNTS } from '../constants/Constants';
import { IUserAccount } from '../models/Index';

const UserAccounts = () => {

  useEffect(()=>{
    getUserAccounts();
  },[]);

  const initializeTable = (id:string,accounts:any[]) => {
    let dataSet:any = [];
    if ( $.fn.dataTable.isDataTable( id ) ) {
      let table = $( id ).DataTable();
      table.destroy();
    }
    accounts.forEach((obj:IUserAccount)=>{
      dataSet.push([
        obj.name,
        obj.balance ? obj.balance : 0,
        obj.withdrawal ? obj.withdrawal : 0,
        obj.advancePay ? obj.advancePay : 0,
        obj.minDeposit ? obj.minDeposit : 0,
        obj.docid
      ]);
    });
    $(id).DataTable({
      order : [], 
      // rowReorder: {
      //   selector: 'td:nth-child(2)'
      // },
      responsive: true,
      data: dataSet,
      columns: [
        { title: "Name" },
        { title: "Balance" },
        { title: "Withdrawal" },
        { title: "Advance payment" },
        { title: "Minimum Deposit" },
        { title: "Account Id" }
    ]
    });
  }

  const getUserAccounts = async () =>{
      try{
          let uaDocs = await firebase.firestore().collection(FB_COL_USER_ACCOUNTS).orderBy("name","asc").get();
          let userAccounts:any[] = [];
          uaDocs.forEach((doc)=>{
              let data = doc.data();
              let docid = doc.id;
              let uaObj:IUserAccount = {
                  name : data.name,
                  balance : data.balance,
                  withdrawal : data.withdrawal,
                  minDeposit : data.minDeposit,
                  advancePay : data.advancePay,
                  docid : docid
              }
              userAccounts.push(uaObj);
          });
          initializeTable("#accountTable",userAccounts)
      }catch(ex){
          console.error(ex);
      }
  }
  return(
        <div id="wrapper">
         <div id="content-wrapper" className="d-flex flex-column">
             <TopNav></TopNav>
             {/* Begin Page Content */}
             <div className="container-fluid" style={{paddingTop: '4.5rem'}}>
               {/* Page Heading */}
               <div className="d-sm-flex align-items-center justify-content-between mb-4">
                 <h1 className="h3 mb-0 text-gray-800">User Accounts</h1>
                 {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i className="fas fa-download fa-sm text-white-50" /> Generate Report</a> */}
               </div>
               <div className="row">
                 {/* Accounts */}
                 <div className="col-xl-12 col-lg-12">
                   <div className="card shadow mb-4">
                     {/* Card Header - Dropdown */}
                     <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                       <h6 className="m-0 font-weight-bold text-primary">Accounts</h6>
                     </div>
                     {/* Card Body */}
                     <div className="card-body">
                      <Table responsive id="accountTable"/>
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

export default UserAccounts;