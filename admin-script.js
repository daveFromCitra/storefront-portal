// Okay, it's 10/12/2022 and I'm tweeking the admin scripts here.
// I'm currently updating the basic DPG design portal to handle Storefront requests. This basically means adding new fields and new thumbnail upload areas.

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, setDoc, doc, arrayUnion, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-storage.js"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDohdzuZgAaWxvN-0G-vOT2Pi3jGPxWmT4",
    authDomain: "dpg-storefront-portal.firebaseapp.com",
    projectId: "dpg-storefront-portal",
    storageBucket: "dpg-storefront-portal.appspot.com",
    messagingSenderId: "27222150008",
    appId: "1:27222150008:web:84e7ec969efe6ffa0ad68d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Init Database
const db = getFirestore();

document.getElementById("main-submit").addEventListener("click", (e) => {
    e.preventDefault();
    autoIncrementOrderId();
})

document.getElementById("report-button").addEventListener("click", (e) => {
    e.preventDefault();
    reportRunner();
})

document.getElementById("main-update").addEventListener("click", (e) => {
    e.preventDefault();
    updateItem();
})

// Change filters selected
document.getElementById("filter-boxes").addEventListener("change", (e) => {
    e.preventDefault();
    updateStack();
})

function autoIncrementOrderId() {
    const lastOrder = query(collection(db, "storefront-jobs"), orderBy("orderNumber", "desc"), limit(1))
    getDocs(lastOrder)
        .then((docs) => {
            docs.forEach(job => {
                let lastOrderNumber = job.data().orderNumber
                let orderNumber = lastOrderNumber + 1;
                console.log(orderNumber);
                submitDesign(orderNumber)
            })
        })
};

function submitDesign(orderNumber) {
    let salesName = document.getElementById('sales-name').value;
    let salesEmail = document.getElementById('sales-email').value;
    let csrName = document.getElementById('csr-name').value;
    let csrEmail = document.getElementById('csr-email').value;
    let customerContact = document.getElementById('customer-name').value;
    let siteName = document.getElementById('site-name').value;
    let siteUrl = document.getElementById('site-url').value;
    let jobTitle = document.getElementById('job-title').value;
    let jobType = document.getElementById('job-type').value;
    let sbType = document.getElementById('sb-type').value;
    let sbCustomization = document.getElementById('sb-customization').value;
    let sbTax = document.getElementById('sb-tax').checked;
    let sbCustomerAdmin = document.getElementById('sb-customer-admin').checked;
    let sbUserAccess = document.getElementById('sb-user-access').value;
    let sbUrl = document.getElementById('sb-url').value;
    //let sbShipping = document.getElementById('sb-shipping-method').value;
    let pType = document.getElementById('p-type').value;
    let pName = document.getElementById('p-name').value;
    let pCategory = document.getElementById('p-category').value;
    let pPrice = document.getElementById('p-price').value;
    // let pThumb = document.getElementById('p-thumb').value;
    // let pPrint = document.getElementById('p-print').value;
    let scWhat = document.getElementById('style-content-what').value;
    let scWhere = document.getElementById('style-content-where').value;
    let catName = document.getElementById('cat-name').value;
    let catProducts = document.getElementById('cat-products').value;
    // let catThumbnail = document.getElementById('cat-thumbnail').value;
    // let shipMehtods = document.getElementById('ship-methods').value;
    // let paymentMethods = document.getElementById('payment-methods').value;
    // let urlNew = document.getElementById('url-new').value;
    let description = document.getElementById('description').value;
    let requiresEstimate = document.getElementById('estimate').checked;
    let rush = document.getElementById('rush').checked;
    let dueDate = new Date( document.getElementById('due-date').value).toLocaleDateString();
    let files = [];
    let timePosted = new Date( Date.now() ).toLocaleDateString()
    // document.getElementsByClassName("file-reference").map((file) => {
    //     files.push(file.url);
    // })
    for (let i = 0; i < document.getElementsByClassName("file-reference").length; i++) {
        const element = document.getElementsByClassName("file-reference")[i];
        files.push(element.dataset.url);
    }
    // console.log(document.getElementsByClassName("file-reference")[0].dataset.url);
    addDoc(collection(db, "storefront-jobs"), {
        salesName: salesName,
        salesEmail: salesEmail,
        csrName: csrName,
        csrEmail: csrEmail,
        customerContact: customerContact,
        siteName: siteName,
        siteUrl: siteUrl,
        jobTitle: jobTitle,
        jobType: jobType,
        sbType: sbType,
        sbCustomization: sbCustomization,
        sbTax: sbTax,
        sbCustomerAdmin: sbCustomerAdmin,
        sbUserAccess: sbUserAccess,
        sbUrl: sbUrl,
        //sbShipping: sbShipping,
        pType: pType,
        pName: pName,
        pCategory: pCategory,
        pPrice: pPrice,
        //pThumb: pThumb,
        //pPrint: pPrint,
        scWhat: scWhat,
        scWhere: scWhere,
        catName: catName,
        catProducts: catProducts,
        //catThumbnail: catThumbnail,
        //shipMehtods: shipMehtods,
        //paymentMethods: paymentMethods,
        //urlNew: urlNew,
        description: description,
        requiresEstimate: requiresEstimate,
        rush: rush,
        dueDate: dueDate,
        status: "requested",
        orderNumber: orderNumber,
        files: files,
        timePosted: timePosted
    })
    updateStack();
}

function statusCheckboxes() {
    let checkedBoxes = [];
    document.getElementById("requestedCheckbox").checked && (checkedBoxes.push("requested"))
    document.getElementById("inProgressCheckbox").checked && (checkedBoxes.push("inprogress"))
    document.getElementById("completeCheckbox").checked && (checkedBoxes.push("complete"))
    document.getElementById("deletedCheckbox").checked && (checkedBoxes.push("deleted"))
    return checkedBoxes
}

function updateStack() {
    const designListContainer = document.getElementById("design-stack-list");
    let currentStack = `<tr>
                            <th>#</th>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Due Date</th>
                            <th>Salesperson</th>
                            <th>Job Type</th>
                            <th>Job Title</th>
                            <th>Status</th>
                        </tr>`;
    // let currentStack = "<tr><th>#</th><th>Order</th><th>EPMS</th><th>CSR Name</th><th>Job Title</th><th>Status</th></tr>";

    let multi = query(collection(db, "storefront-jobs"), orderBy("orderNumber"), where("status", "in", statusCheckboxes()))
    // let multi = query(collection(db, "storefront-jobs"), orderBy("orderNumber"))

    getDocs(multi)
        .then((docs) => {
            docs.forEach(job => {
                try {
                    let refId = job.id;
                    let jobData = job.data();
                    let orderNumber = jobData.orderNumber;
                    let dateOrdered = jobData.timePosted;
                    let dueDate = jobData.dueDate;
                    let salesName = jobData.salesName;
                    let jobType = jobData.jobType;
                    let jobTitle = jobData.jobTitle;
                    let status = jobData.status;
                    let rowStyle = 'secondary';
                    switch (status) {
                        case 'complete':
                            rowStyle = 'success'
                            break;
                        case 'requested':
                            rowStyle = 'warning'
                            break;
                        case 'inprogress':
                            rowStyle = 'primary'
                            break;
                        case 'deleted':
                            rowStyle = 'danger'
                            break;
                    }
                    let listItem = `<tr data-ref-id="${refId}" data-item-status="${status}" class="reprint-item table-${rowStyle}">
                                        <td><input class="form-check-input" type="checkbox" value="" ></td>
                                        <td><a href="./orderdetails.html?refId=${refId}">${orderNumber}</a></td>
                                        <td>${dateOrdered}</td>
                                        <td>${dueDate}</td>
                                        <td>${salesName}</td>
                                        <td>${jobType}</td>
                                        <td>${jobTitle}</td>
                                        <td>${status}</td>
                                    </tr>`
                    // let listItem = ` <tr data-ref-id="${refId}" data-item-status="${status}" class="reprint-item table-${rowStyle}"><td><input class="form-check-input" type="checkbox" value="" ></td><td><a href="./orderdetails.html?refId=${refId}">${orderNumber}</a></td><td>${epms}</td><td>${csrName}</td><td>${jobTitle}</td><td>${status}</td></tr>`
                    currentStack = currentStack + listItem;

                }
                catch (error) {
                    console.error(error);
                }
            });

            designListContainer.innerHTML = currentStack;
        })
        .catch((error) => console.error(error))
}
updateStack();


const fileUploadArea = document.getElementById("formFileMultiple");
const thumbFileUploadArea = document.getElementById("formThumbFileMultiple");
const printFileUploadArea = document.getElementById("formPrintFileMultiple");


fileUploadArea.addEventListener("change", () => {
    for (let i = 0; i < fileUploadArea.files.length; i++) {
        const file = fileUploadArea.files[i];
        addPdfsToBucket(file)
    }
})

thumbFileUploadArea.addEventListener("change", () => {
    for (let i = 0; i < thumbFileUploadArea.files.length; i++) {
        const file = thumbFileUploadArea.files[i];
        addPdfsToBucket(file, "thumb")
    }
})

printFileUploadArea.addEventListener("change", () => {
    for (let i = 0; i < printFileUploadArea.files.length; i++) {
        const file = printFileUploadArea.files[i];
        addPdfsToBucket(file, "print")
    }
})

function addPdfsToBucket(file, type) {
    const storage = getStorage()
    const fileRef = ref(storage, file.name);
    document.getElementById("main-submit").style.display = "none"
    uploadBytes(fileRef, file)
        .then((file) => getDownloadURL(fileRef)
            .then((url) => {
                document.getElementById(`${type}-uploading`).innerHTML += `<div class="file-reference" data-url="${url}"> ${fileRef.name} uploaded </div>`;
            })
            .catch((error) => console.error(error))
        )
        .catch((error) => console.error(error))
        .finally((url) => {
            document.getElementById("main-submit").style.display = "block"
        })
}

function reportRunner() {
    let multi = query(collection(db, "storefront-jobs"), orderBy("orderNumber"))

    getDocs(multi)
        .then((docs) => {
            let csv = `"refId", "orderNumber", "salesName", "salesEmail", "csrName", "csrEmail", "customerContact", "siteName", "siteUrl", "jobTitle", "jobType", "sbType", "sbCustomization", "sbTax", "sbCustomerAdmin", "sbUserAccess", "sbUrl", "sbShipping", "pType", "pName", "pCategory", "pPrice", "scWhat", "scWhere", "catName", "catProducts", "description", "requiresEstimate", "rush", "dueDate", "timePosted"\r\n`;
            docs.forEach(job => {
                try {
                    let refId = job.id;
                    let jobData = job.data();
                    console.log(jobData);
                    let orderNumber = jobData.orderNumber;
                    let salesName = jobData.salesName;
                    let salesEmail = jobData.salesEmail;
                    let csrName = jobData.csrName;
                    let csrEmail = jobData.csrEmail;
                    let customerContact = jobData.customerContact;
                    let siteName = jobData.siteName;
                    let siteUrl = jobData.siteUrl;
                    let jobTitle = jobData.jobTitle;
                    let jobType = jobData.jobType;
                    let sbType = jobData.sbType;
                    let sbCustomization = jobData.sbCustomization;
                    let sbTax = jobData.sbTax;
                    let sbCustomerAdmin = jobData.sbCustomerAdmin;
                    let sbUserAccess = jobData.sbUserAccess;
                    let sbUrl = jobData.sbUrl;
                    let sbShipping = jobData.sbShipping;
                    let pType = jobData.pType;
                    let pName = jobData.pName;
                    let pCategory = jobData.pCategory;
                    let pPrice = jobData.pPrice;
                    //let pThumb = job.pThumb;
                    //let pPrint = job.pPrint;
                    let scWhat = jobData.scWhat;
                    let scWhere = jobData.scWhere;
                    let catName = jobData.catName;
                    let catProducts = jobData.catProducts;
                    //let catThumbnail = job.catThumbnail;
                    //let shipMehtods = job.shipMehtods;
                    //let paymentMethods = job.paymentMethods;
                    //let urlNew = job.urlNew;
                    let description = jobData.description;
                    let requiresEstimate = jobData.requiresEstimate;
                    let rush = jobData.rush;
                    let dueDate = jobData.dueDate;
                    let timePosted = jobData.timePosted

                    csv = csv + `"${refId}", "${orderNumber}", "${salesName}", "${salesEmail}", "${csrName}", "${csrEmail}", "${customerContact}", "${siteName}", "${siteUrl}", "${jobTitle}", "${jobType}", "${sbType}", "${sbCustomization}", "${sbTax}", "${sbCustomerAdmin}", "${sbUserAccess}", "${sbUrl}", "${sbShipping}", "${pType}", "${pName}", "${pCategory}", "${pPrice}", "${scWhat}", "${scWhere}", "${catName}", "${catProducts}", "${description}", "${requiresEstimate}", "${rush}", "${dueDate}", "${timePosted}"\r\n`;
                } catch (error) {
                    console.error(error);
                }
            })
            download("csv.csv", csv)
        })
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Log any update to the line item status
function logUpdate(refId, action) {
    let logEntry = { "action": action, "time": Date.now() }
    getDoc(doc(db, "storefront-jobs", refId))
        .then((docLog) => {
            let updateLog = docLog.data().updated
            updateLog.push(logEntry);
            setDoc(doc(db, 'reprints', refId), { updated: updateLog }, { merge: true })
        })
}

// Update the status of a line item
function updateItem() {
    const updateCommand = document.getElementById("updateCommand").value
    const itemList = document.getElementById("design-stack-list")
    const itemArray = itemList.querySelectorAll(".reprint-item")
    itemArray.forEach(item => {
        let refId = item.dataset.refId
        let refIdDoc = doc(db, 'storefront-jobs', refId);
        let isChecked = item.children[0].children[0].checked
        if (isChecked) {
            setDoc(refIdDoc, { status: updateCommand }, { merge: true })
                .then(() => {
                    logUpdate(refId, updateCommand);
                    updateStack();
                })
        } else { }
    });

}


// Hide unwanted elements in the form
document.getElementById("storefront-build-fields").style.display = 'none'
document.getElementById("product-fields").style.display = 'none'
document.getElementById("category-fields").style.display = 'none'
document.getElementById("style-content-change-fields").style.display = 'none'
document.getElementById("shipping-fields").style.display = 'none'
document.getElementById("payment-fields").style.display = 'none'

const jobSelector = document.getElementById("job-type")
jobSelector.addEventListener("change", () => {
    document.getElementById("storefront-build-fields").style.display = 'none'
    document.getElementById("product-fields").style.display = 'none'
    document.getElementById("category-fields").style.display = 'none'
    document.getElementById("style-content-change-fields").style.display = 'none'
    document.getElementById("shipping-fields").style.display = 'none'
    document.getElementById("payment-fields").style.display = 'none'

    document.getElementById( jobSelector.value ).style.display = 'block'
    
    console.log( jobSelector.value )
})