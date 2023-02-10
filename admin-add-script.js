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