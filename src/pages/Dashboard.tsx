import React, { useEffect, useState } from 'react';
import { 
    FB_COL_ACCOUNTS,
    FB_COL_TRANSACTION_LOGS,
    FB_COL_USERS,
    FB_COL_USER_ACCOUNTS,
    FB_DOC_ACCOUNT
} from '../constants/Constants';
import firebase from '../firebase';
import { Pie } from 'react-chartjs-2';
import TopNav from '../components/TopNavigation';
import { Table } from 'react-bootstrap';
import $ from 'jquery';
import moment from 'moment';
import 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css';

import "../styles/Dashboard.css";
import "../styles/font-awesome.css";
import "../styles/nunito-font.css";
import { useAuth } from '../contexts/AuthContext';
import { IAccount, ITLog } from '../models/Index';

const data = {
  labels: ['Remaining', 'Withdrawal', 'Interest'],
  datasets: [
    {
      label: '',
      data: [0, 0, 0],
      backgroundColor: [
        '#D4AC0D',
        '#E74C3C',
        '#27AE60',
      ],
      borderWidth: 1,
    }
  ]
}

//import "../styles/nucleo-icons.css";
const Dashboard = () => {

    const [accountData, setAccountData] = useState<any>();
    const [transactionLog, setTransactionLog] = useState<any>();
    const [currentUserData, setCurrentUserData] = useState<any>();
    const [currentUserAccount, setCurrentUserAccount] = useState<any>();
    const [chartData, setChartData] = useState(data);

    const { currentUser }:any = useAuth();

    useEffect(()=>{
      window.scrollTo(0, 0);
        loadDetails();
    },[]);

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
        pageLength : 5,
        lengthMenu : [5,10],
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

    const loadDetails = async () =>{
        try{
            const userDoc = await firebase.firestore().collection(FB_COL_USERS).doc(currentUser?.uid).get();
            const userData:any = userDoc.data();
            const currentUserDoc = await firebase.firestore().collection(FB_COL_USER_ACCOUNTS).doc(userData.linkId).get();
            const currentUserAccount = currentUserDoc.data();
            const accountDoc = await firebase.firestore().collection(FB_COL_ACCOUNTS).doc(FB_DOC_ACCOUNT).get();//("IsActive","==",true).get().then(function(querySnapshot) {
            let docData:any = accountDoc.data();
            let accountData:IAccount = {
                TotalAmount : docData.TotalAmount,
                RemainingAmount : docData.RemainingAmount,
                TotalInterest : docData.TotalInterest,
                WithdrawalAmount : docData.WithdrawalAmount,
                MinimumBalance : docData.MinimumBalance
            };
            const TLog = await firebase.firestore().collection(FB_COL_TRANSACTION_LOGS).orderBy('timestamp',"desc").limit(10).get();
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
            let cData = chartData;
            cData.datasets = [
              {
                label: '',
                data: [accountData.RemainingAmount, accountData.WithdrawalAmount as any, accountData.TotalInterest],
                backgroundColor: [
                  '#D4AC0D',
                  '#E74C3C',
                  '#27AE60',
                ],
                borderWidth: 0
              }
            ]
            setChartData(cData);
            setAccountData(accountData);
            setTransactionLog(transactionLog);
            setCurrentUserData(userData);
            setCurrentUserAccount(currentUserAccount);
            initializeTable("#top10table",transactionLog);
        }catch(ex){
            console.error(ex);
        }
    }

    return(
        <React.Fragment>
       <div id="wrapper">
        <div id="content-wrapper" className="d-flex flex-column">
            <TopNav></TopNav>
            {/* Begin Page Content */}
            <div className="container-fluid" style={{paddingTop: '4.5rem'}}>
              {/* Page Heading */}
              <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                {/* <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm"><i className="fas fa-download fa-sm text-white-50" /> Generate Report</a> */}
              </div>
              {/* Content Row */}
              <div className="row">
                {/* Balance Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-primary shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Balance</div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">₹ {currentUserAccount?.balance.toString() ? currentUserAccount?.balance : "updating..."}</div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-calendar fa-2x text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Withdrawal Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-success shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Withdrawal</div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">₹ {currentUserAccount?.withdrawal.toString() ? currentUserAccount?.withdrawal : "updating..."}</div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-dollar-sign fa-2x text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Minimum Deposit Card Example */}
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-info shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Advance Payment</div>
                          <div className="row no-gutters align-items-center">
                            <div className="col-auto">
                              <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">₹ {currentUserAccount?.advancePay.toString() ? currentUserAccount?.advancePay : "updating..."}</div>
                            </div>
                            {/* <div className="col">
                              <div className="progress progress-sm mr-2">
                                <div className="progress-bar bg-info" role="progressbar" style={{width: '50%'}} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} />
                              </div>
                            </div> */}
                          </div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-clipboard-list fa-2x text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Advance Pay Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                  <div className="card border-left-warning shadow h-100 py-2">
                    <div className="card-body">
                      <div className="row no-gutters align-items-center">
                        <div className="col mr-2">
                          <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Minimum Deposit</div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">₹ {currentUserAccount?.minDeposit.toString() ? currentUserAccount?.minDeposit : "updating..."}</div>
                        </div>
                        <div className="col-auto">
                          <i className="fas fa-comments fa-2x text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Content Row */}
              <div className="row">
                {/* Overview */}
                <div className="col-xl-8 col-lg-7">
                  <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">Overview</h6>
                    </div>
                    {/* Card Body */}
                    <div className="card-body">
                     <Pie data={chartData} width={500} height={250} options={{ maintainAspectRatio: false,legend:{position:'right'} }}/>
                    </div>
                  </div>
                </div>
                {/* Pie Chart */}
                <div className="col-xl-4 col-lg-5">
                  <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">Account Summary</h6>
                    </div>
                    {/* Card Body */}
                    <div className="card-body">
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Total Amount</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{accountData?.TotalAmount}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Withdrawal Amount</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{accountData?.WithdrawalAmount}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Interest Amount</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{accountData?.TotalInterest}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Remaining Amount</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{accountData?.RemainingAmount}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Account Minimum Balance</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{accountData?.MinimumBalance}</span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* Content Row */}
              <div className="row">
                {/* Your Account Details */}
                <div className="col-xl-4 col-lg-5">
                  <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">Your Account Details</h6>
                    </div>
                    {/* Card Body */}
                    <div className="card-body">
                     <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Balance</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{currentUserAccount?.balance}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Withdrawal</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{currentUserAccount?.withdrawal}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Advance Payment</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{currentUserAccount?.advancePay}</span>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row">
                            <div className="col-sm-12">
                              <span>Minimum Deposit</span>
                              <span style={{fontWeight:'bold',float:'right'}}>{currentUserAccount?.minDeposit}</span>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Top 10 Transactions */}
                <div className="col-xl-8 col-lg-7">
                  <div className="card shadow mb-4">
                    {/* Card Header - Dropdown */}
                    <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                      <h6 className="m-0 font-weight-bold text-primary">Top 10 Transactions</h6>
                    </div>
                    {/* Card Body */}
                    <div className="card-body">
                      <Table responsive id="top10table">
                        
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
         </React.Fragment>
    );
}

export default Dashboard;