import React, { useEffect } from 'react';
import TopNav from '../components/TopNavigation';
import $ from 'jquery';
import moment from 'moment';
import 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css';
import firebase from '../firebase';
import { Table } from 'react-bootstrap';
import { ITLog } from '../models/Index';
import { FB_COL_TRANSACTION_LOGS } from '../constants/Constants';

const AllTransactions = () => {

    useEffect(()=>{
      getTLog();
    },[]);

    const getTLog = async () =>{
      try{
          const TLog = await firebase.firestore().collection(FB_COL_TRANSACTION_LOGS).orderBy('timestamp',"desc").get();
          let transactionLog:any[] = [];
          TLog.forEach((doc)=>{
              let logData = doc.data();
              let logId = doc.id;
              let logObj:ITLog = {
                  docID : logId,
                  name : logData.name,
                  type : logData.type,
                  amount : logData.amount,
                  createdBy : logData.createdBy,
                  createdTime : logData.createdTime,
                  creditType : logData.creditType
              }
              transactionLog.push(logObj);
          });
          initializeTable("#transactionTable",transactionLog)
      }catch(ex){
          console.error(ex);
      }
    }

    const initializeTable = (id:string,transactions:any[]) => {
      let dataSet:any = [];
      if ( $.fn.dataTable.isDataTable( id ) ) {
        let table = $( id ).DataTable();
        table.destroy();
      }
      transactions.forEach((obj:ITLog)=>{
        dataSet.push([
          obj.createdTime ? moment(obj.createdTime).format("DD-MMM-YYYY hh:mm:ss") : "",
          obj.name,
          obj.creditType ? obj.creditType == "saving" ? "deposit" : obj.creditType : "withdrawal",
          obj.type,
          obj.amount
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
          { title: "Date" },
          { title: "Name" },
          { title: "Transaction Type" },
          { title: "Type" },
          { title: "Amount." }
      ]
      });
    }

    return(
       <div id="wrapper">
        <div id="content-wrapper" className="d-flex flex-column">
            <TopNav></TopNav>
            {/* Begin Page Content */}
            <div className="container-fluid" style={{paddingTop: '4.5rem'}}>
              {/* Page Heading */}
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">All Transactions</h1>
                {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i className="fas fa-download fa-sm text-white-50" /> Generate Report</a> */}
              </div>
              <div className="row">
                {/* Transaction */}
                <div className="col-xl-12 col-lg-12">
                  <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">Transactions</h6>
                    </div>
                    {/* Card Body */}
                    <div className="card-body">
                      <Table responsive id="transactionTable">
                        
                        </Table>
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

export default AllTransactions;