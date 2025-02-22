/* authRoute */
// FOR REGISTRATION
// http://localhost:7687/api/auth/register-account METHOD:POST

// FOR GETTING ALL USERS
// http://localhost:7687/api/auth/get-all-users  METHOD:GET

// FOR LOGIN
// http://localhost:7687/api/auth/login METHOD:POST

// FOR LOGOUT
// http://localhost:7687/api/auth/logout  METHOD:POST

// FOR CHECK AUTH
// http://localhost:7687/api/auth/check-auth  METHOD:GET
 
/* benefitRoute */

//FOR CREATING BENEFIT
// http://localhost:7687/api/benefit/create-benefit METHOD: POST

//FOR GETTING BENEFITS
// http://localhost:7687/api/benefit/get-all-benefits METHOD: GET

//FOR UPDATING
// http://localhost:7687/api/benefit/update-benefit/:id METHOD: PUT

//FOR DELETING BENEFIT
// http://localhost:7687/api/benefit/delete-benefit/:id METHOD: DELETE


/* benefitRequestRoute */
//FOR CREATING BENEFIT REQUEST
// http://localhost:7687/api/benefitRequest/apply-benefit METHOD: POST

//FOR GETTING MY BENEFIT REQUEST
// http://localhost:7687/api/benefitRequest/get-my-apply-requests METHOD: GET

//FOR GETTING ALL BENEFIT REQUEST
// http://localhost:7687/api/benefitRequest/get-all-applied-requests METHOD: GET

//FOR UPDATING ALL BENEFIT REQUEST
// http://localhost:7687/api/benefitRequest/update-apply-request-status METHOD: PUT

/* benefitDeductionRoute */

//FOR CREATING BENEFIT DEDUCTIONS
// http://localhost:7687/api/benefitDeduction/add-user-deduction METHOD: POST

// FOR GETTING AUTHENTICATED DEDUCTIONS
//http://localhost:7687/api/benefitDeduction/get-my-deductions METHOD: GET
//benefitDeductionRoute.get("/get-my-deductions",getMyDeduction)

// FOR GETTING ALL DEDUCTIONS
//http://localhost:7687/api/benefitDeduction/get-all-deductions METHOD: GET
//benefitDeductionRoute.get("/get-all-deductions",verifyToken,getAllBenefitDeductions)


// FOR GETTING UPDATING  DEDUCTIONS
//http://localhost:7687/api/benefitDeduction/update-user-deduction METHOD: PUT


/* incentiveRoute */
//http://localhost:7687/api/incentive/get-all-incentives METHOD: GET


//http://localhost:7687/api/incentive/create-incentive METHOD: POST

//http://localhost:7687/api/incentive/update-incentive/:id   METHOD:PUT
//http://localhost:7687/api/incentive/delete-incentive/:id   METHOD:DELETE

/* incentiveTrackingRoute */

//http://localhost:7687/api/incentiveTracking/create-incentive-tracking

//http://localhost:7687/api/incentiveTracking/get-all-incentive-tracking

//http://localhost:7687/api/incentiveTracking/get-my-incentives-tracking

//http://localhost:7687/api/incentiveTracking/update-incentive-tracking/67b98d7129612c8ae2ee8996

//http://localhost:7687/api/incentiveTracking/delete-incentive-tracking/67b98d7129612c8ae2ee8996