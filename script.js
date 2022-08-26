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

// Submit new order
document.getElementById("main-submit").addEventListener("click", (e) => {
    e.preventDefault();
    autoIncrementOrderId();
})

// Change filters selected
document.getElementById("filter-boxes").addEventListener("change", function(e) {
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
                submitDesign(orderNumber);
            })
        })
};

function submitDesign(orderNumber) {
    let csrName = document.getElementById("csr-name").value;
    let salesName = document.getElementById("sales-name").value;
    let customerContact = document.getElementById("customer-contact").value;
    let jobType = document.getElementById("job-type").value;
    let jobTitle = document.getElementById("job-title").value;
    let epms = document.getElementById("epms").value;
    let pickupJob = document.getElementById("pickup-job").value;
    let dueDate = document.getElementById("due-date").value;
    let clientBuget = document.getElementById("client-budget").value;
    let description = document.getElementById("description").value;
    let proofingInstructions = document.getElementById("proofing-instructions").value;
    let estimate = document.getElementById("estimate").checked;
    let rush = document.getElementById("rush").checked;
    let files = [];

    for (let i = 0; i < document.getElementsByClassName("file-reference").length; i++) {
        const element = document.getElementsByClassName("file-reference")[i];
        files.push(element.dataset.url);
    }
    // console.log(document.getElementsByClassName("file-reference")[0].dataset.url);
    addDoc(collection(db, "storefront-jobs"), {
        csrName: csrName,
        salesName: salesName,
        customerContact: customerContact,
        jobType: jobType,
        jobTitle: jobTitle,
        epmsNumber: epms,
        pickupJob: pickupJob,
        dueDate: dueDate,
        clientBudget: clientBuget,
        description: description,
        proofingInstruictions: proofingInstructions,
        requiresEstimate: estimate,
        rush: rush,
        status: "requested",
        orderNumber: orderNumber,
        files: files
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

function reportRunner() {
    let multi = query(collection(db, "storefront-jobs"), orderBy("orderNumber"))

    getDocs(multi)
        .then((docs) => {
            let csv = `"refId","order number", "epms number", "csr name", "job title"\r\n`;
            docs.forEach(job => {
                try {
                    let refId = job.id;
                    let jobData = job.data();
                    let orderNumber = jobData.orderNumber;
                    let epms = jobData.epmsNumber;
                    let csrName = jobData.csrName;
                    let jobTitle = jobData.jobTitle;

                    csv = csv + `"${refId}", "${orderNumber}", "${epms}", "${csrName}", "${jobTitle}"\r\n`;
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

function updateStack() {
    const designListContainer = document.getElementById("design-stack-list");
    let currentStack = `<tr>
                            <th>Order</th>
                            <th>Due Date</th>
                            <th>CSR Name</th>
                            <th>EPMS</th>
                            <th>Customer</th>
                            <th>Job Title</th>
                            <th>Status</th>
                        </tr>`;

    let multi = query(collection(db, "storefront-jobs"), orderBy("orderNumber"), where("status", "in", statusCheckboxes()))
    getDocs(multi)
        .then((docs) => {
            docs.forEach(job => {
                try {
                    let refId = job.id;
                    let jobData = job.data();
                    let orderNumber = jobData.orderNumber;
                    let epms = jobData.epmsNumber;
                    let dueDate = jobData.dueDate;
                    let customerContact = jobData.customerContact;
                    let csrName = jobData.csrName;
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
                                        <td>${orderNumber}</td>
                                        <td>${dueDate}</td>
                                        <td>${csrName}</td>
                                        <td>${epms}</td>
                                        <td>${customerContact}</td>
                                        <td>${jobTitle}</td>
                                        <td>${status}</td>
                                    </tr>`
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

function addPdfsToBucket(file) {
    const storage = getStorage()
    const fileRef = ref(storage, file.name);
    document.getElementById("main-submit").style.display = "none"
    uploadBytes(fileRef, file)
        .then((file) => getDownloadURL(fileRef)
            .then((url) => {
                document.getElementById("uploading").innerHTML += `<div class="file-reference" data-url="${url}"> ${fileRef.name} uploaded </div>`;
            })
            .catch((error) => console.error(error))
        )
        .catch((error) => console.error(error))
        .finally((url) => {
            document.getElementById("main-submit").style.display = "block"
        })
}

updateStack();


const fileUploadArea = document.getElementById("formFileMultiple");

fileUploadArea.addEventListener("change", () => {
    for (let i = 0; i < fileUploadArea.files.length; i++) {
        const file = fileUploadArea.files[i];
        addPdfsToBucket(file)
    }
})

