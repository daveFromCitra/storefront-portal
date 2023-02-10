// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, getDoc, setDoc, doc, arrayUnion, updateDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";

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


const urlParams = location.search;
const orderRefId = urlParams.match(/(?![?refId=])\w+/g)[0];

function updatePage() {
    getDoc(doc(db, "storefront-jobs", orderRefId))
        .then((doc) => setOrderData(doc.data()))
        .catch((error) => console.error(error))
}

function addUrlDownloadLinks(files) {
    let downloadLink = "";
    try {
        files.forEach(url => {
            downloadLink += `<a href="${url}" download>Download File</a><br>`
        });
    } catch (error) {
        console.error(error);
    }
    return downloadLink;
}

function addPdfFrames(files) {
    let pdfFrame = "";
    try {
        files.forEach(url => {
            if (url.includes(".pdf")) {
                pdfFrame += `<iframe src="${url}" type="pdf" width="100%" height="100%"></iframe>`
            } else {
                pdfFrame += `<img src="${url}" />`
            }
        });
    } catch (error) {
        console.error(error);
    }
    return pdfFrame;
}

function setOrderData(orderObject) {
    console.log(orderObject);
    const orderInfo = `
    <style>
        .list-group-item {
            display: none;
        }
        .list-group-item.general,
        .list-group-item.${orderObject.jobType} {
            display: block;
        }
    </style>
    <div class="col">
         <h1>Order Number: ${orderObject.orderNumber}</h1>
         <p><b>Status: </b>${orderObject.status}</p>
         <br>
         <!-- <p><b>CSR Name: </b>${orderObject.csrName}</p>
         <p><b>Customer Contact: </b>${orderObject.customerContact}</p>
         <p><b>Job Title: </b>${orderObject.jobTitle}</p>
         <p><b>EPMS Number: </b>${orderObject.epmsNumber}</p>
         <p><b>Pickup Job: </b>${orderObject.pickupJob}</p>
         <p><b>Due Date: </b>${orderObject.dueDate}</p>
         <p><b>Client Budget: </b>${orderObject.clientBudget}</p>
         <p><b>Description: </b>${orderObject.description}</p>
         <p><b>Requires Estimate?: </b>${orderObject.requiresEstimate}</p>
         <p><b>Is a Rush?: </b> ${orderObject.rush}</p>
         <p><b>Attached Files:</b><br>${addUrlDownloadLinks(orderObject.files)}</p> -->
         <ul class="list-group">
            <li class='list-group-item general'><b>Sales Rep Name:</b> ${orderObject.salesName}</li>
            <li class='list-group-item general'><b>Sales Rep Email:</b> ${orderObject.salesEmail}</li>
            <li class='list-group-item general'><b>CSR Name:</b> ${orderObject.csrName}</li>
            <li class='list-group-item general'><b>CSR Email:</b> ${orderObject.csrEmail}</li>
            <li class='list-group-item general'><b>Customer Name:</b> ${orderObject.customerContact}</li>
            <li class='list-group-item general'><b>Site Name:</b> ${orderObject.siteName}</li>
            <li class='list-group-item general'><b>Site URL:</b> ${orderObject.siteUrl}</li>
            <li class='list-group-item general'><b>Job Title:</b> ${orderObject.jobTitle}</li>
            <li class='list-group-item general'><b>Job Type:</b> ${orderObject.jobType}</li>
            <li class='list-group-item storefront-build-fields'><b>Store Type:</b> ${orderObject.sbType}</li>
            <li class='list-group-item storefront-build-fields'><b>Style Customization:</b> ${orderObject.sbCustomization}</li>
            <li class='list-group-item storefront-build-fields'><b>Store Taxable:</b> ${orderObject.sbTax}</li>
            <li class='list-group-item storefront-build-fields'><b>Need Customer Admin:</b> ${orderObject.sbCustomerAdmin}</li>
            <li class='list-group-item storefront-build-fields'><b>User Access:</b> ${orderObject.sbUserAccess}</li>
            <li class='list-group-item storefront-build-fields'><b>Customer URL:</b> ${orderObject.sbUrl}</li>
            <li class='list-group-item storefront-build-fields'><b>Shipping Method:</b> ${orderObject.sbShipping}</li>
            <li class='list-group-item product-fields'><b>Product Type:</b> ${orderObject.pType}</li>
            <li class='list-group-item product-fields'><b>Product Name:</b> ${orderObject.pName}</li>
            <li class='list-group-item product-fields'><b>Category Name:</b> ${orderObject.pCategory}</li>
            <li class='list-group-item product-fields'><b>Price:</b> ${orderObject.pPrice}</li>
            <li class='list-group-item product-fields'><b>Upload Thumbnail:</b> ${orderObject.pThumb}</li>
            <li class='list-group-item product-fields'><b>Upload Print File:</b> ${orderObject.pPrint}</li>
            <li class='list-group-item style-content-change-fields'><b>What needs to be changed:</b> ${orderObject.scWhat}</li>
            <li class='list-group-item style-content-change-fields'><b>Where does the change need to be made:</b> ${orderObject.scWhere}</li>
            <li class='list-group-item category-fields'><b>Category Name:</b> ${orderObject.catName}</li>
            <li class='list-group-item category-fields'><b>Products in Category:</b> ${orderObject.catProducts}</li>
            <li class='list-group-item category-fields'><b>Upload Thumbnails:</b> ${orderObject.catThumbnail}</li>
            <li class='list-group-item shipping-fields'><b>Change Shipping Methods:</b> ${orderObject.shipMehtods}</li>
            <li class='list-group-item payment-fields'><b>Payment Methods:</b> ${orderObject.paymentMethods}</li>
            <li class='list-group-item url-fields'><b>New URL:</b> ${orderObject.urlNew}</li>
            <li class='list-group-item general'><b>Description:</b> ${orderObject.description}</li>
            <li class='list-group-item general'><b>Requires Estimate:</b> ${orderObject.requiresEstimate}</li>
            <li class='list-group-item general'><b>Is it a Rush?:</b> ${orderObject.rush}</li>
            <li class='list-group-item general'><b>Requested Due Date:</b> ${orderObject.dueDate}</li>
        </ul>
     </div>
     <div class="col">
         ${addPdfFrames(orderObject.files)}
     </div>
     `
    document.getElementById("order-info").innerHTML = orderInfo;
}

function updateItem() {
    let refId = orderRefId;
    let refIdDoc = doc(db, 'storefront-jobs', refId);
    const updateCommand = document.getElementById("updateCommand").value
    setDoc(refIdDoc, { status: updateCommand }, { merge: true })
        .then(() => {
            //logUpdate(refId, updateCommand);
            updatePage();
        })
}

function jobTimerStart() {
    let timestamp = Date.now();
    getDoc(doc(db, "storefront-jobs", orderRefId))
    .then()
}


document.getElementById("main-update").addEventListener("click", (e) => {
    e.preventDefault();
    console.log("EVERYTHING!!!");
    updateItem();
})

updatePage();