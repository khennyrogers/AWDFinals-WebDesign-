/*
    Enhancements that is possible to be added:
    1. Change billing address
    2. Validation to payment method
    3. Change product ordered
    4. Voucher
    5. Remove specific item to cart
*/

/*
    Pages that uses this script:
    1. Index
    2. Cart
    3. Checkout
*/

var lastSelectedPaymentMethod = "";

// Let's pretend that we have an actual database.
const itemsBeingSold = [
    { id: 1, name: "Pikachu", price: 1500, imagePath: "./images/pikachu.png" },
    { id: 2, name: "Bulbasur", price: 1000, imagePath: "./images/bulb.png" },
    { id: 3, name: "Charizard", price: 2000, imagePath: "./images/chars.png" },
    { id: 4, name: "500 Pokecoins", price: 550, imagePath: "./pokemon img/500coins.webp" },
    { id: 5, name: "1300 Pokecoins", price: 1350, imagePath: "./pokemon img/1500coins.webp" },
    { id: 6, name: "2500 pokecoins", price: 3000, imagePath: "./pokemon img/1200 pokécoins.webp" },
    { id: 7, name: "5000 pokecoins", price: 5500, imagePath: "./pokemon img/3000coins.webp" },
    { id: 8, name: "10000 pokecoins", price: 110000, imagePath: "./pokemon img/10000coins.webp" },
    { id: 9, name: "1 Lure Module", price: 150, imagePath: "./pokemon img/trial.jpg" },
    { id: 10, name: "3 Lure Modules", price: 400, imagePath: "./pokemon img/trial2.jpg" },
    { id: 11, name: "Egg Incubator", price: 300, imagePath: "./pokemon img/incubator.jpg" },
];

// Checkout fees, you may change this value.
const checkoutFees = {
    shippingTotalPerIndividualItem: 10,
    handingFeePerIndividualItem: 15
};

const transactionType = {
    addToCart: { id: 1, description: "Add to cart", type: "Insert to cart" },
    updateCart: { id: 2, description: "Updated cart", type: "Update cart"},
    clearCart: { id: 3, description: "Clear cart", type: "Clear cart"},
    checkoutCart: { id: 4, description: "Checkout cart items", type: "Checkout"},
    placeOrder: { id: 5, description: "Placed order items", type: "Place order"}
};

// Onload listener.
document.addEventListener("DOMContentLoaded", function() {
    let currentPathName = getCurrentPathname();

    if (currentPathName == "checkout.html"){
        initializeCartItems();
        if (checkCartLengthTogglePaymentMethodAndSummary()) {
            initializeSelectedPaymentMethod();
            initializePlaceOrderButtonListener();
            initializeSummary();
        }
    }

    if (currentPathName == "cart.html") {
        initializeCartItems();
        initializeCartActionButtonsListener();
    }

    if (currentPathName == "store.html") {
        initializeItemsBeingSoldToContainer();
        initializeAddToCartListener();
    }

    if (currentPathName == "profile.html") {
        initializeTransactionLogs();
    }
});

// Copy-pasted from previous version.
function openAlert(title, message) {
    const customAlert = document.getElementById('custom-alert');
    customAlert.querySelector('h2').textContent = title;
    customAlert.querySelector('p').textContent = message;
    customAlert.style.display = 'block';
}

// Copy-pasted from previous version.
function closeAlert() {
    document.getElementById('custom-alert').style.display = 'none';
}

// Get current page.
function getCurrentPathname () {
    let currentPathName = window.location.pathname;
    let fileName = currentPathName.substring(currentPathName.lastIndexOf("/") + 1);
    return fileName;
}

// Get current date and time (formatted)
function getCurrentDateTime () {
    const months = [
        'January', 
        'February', 
        'March', 
        'April', 
        'May', 
        'June', 
        'July', 
        'August', 
        'September', 
        'October', 
        'November', 
        'December'
    ];

    const currentDate = new Date();

    const monthName = months[currentDate.getMonth()];
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let seconds = currentDate.getSeconds();
    seconds = seconds < 10 ? '0' + seconds : seconds;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)

    const formattedDateTime = `${ monthName } ${ day }, ${ year } ${ hours }:${ minutes }:${ seconds } ${ ampm }`;

    return formattedDateTime;
}

// Check cart size, if there's no item, hide payment method and summary.
function checkCartLengthTogglePaymentMethodAndSummary() {
    const userCartItems = getCartItems();
    const paymentMethodSection = document.getElementById('payment-method');
    const summarySection = document.getElementById('summary');

    console.log(userCartItems);
    if (userCartItems.length == 0) {
        paymentMethodSection.style.display = "none";
        summarySection.style.display = "none";
        return false;
    }
    else {
        return true;
    }
}

// Helper function for transforming a simple number to a comma-delimited number.
function addCommasToNumber(value) {
    let stringValue = value.toString();
    let parts = stringValue.split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "." + parts[1] : "";
    let integerWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return integerWithCommas + decimalPart;
}

/* 
    Get cart items based on player/user email address
    Cart format:

    [{ id: number, itemCount: number }]

    Items are being stored in an object array, with
    properties namely id and itemCount.
*/
function getCartItems() {
    const playerEmail = localStorage.getItem("CurrentLoginEmail");

    if (playerEmail == null) {
        return null;
    }

    let cartItemsString = localStorage.getItem(`${playerEmail}CartItems`);

    if (cartItemsString) {
        let cartItems = JSON.parse(cartItemsString);
        return cartItems;
    }
    else {
        return [];
    }
}

/*
    Add/Update item from the cart using @itemId

    @itemId: number

    Keep in mind that we have a cart with a format of an object
    array, containing id and itemCount properties

    If getCartItems returns null, there is no logged in user
    If getCartItems is empty, add
    Otherwise, if the item already exist in the cart, update the
    itemCount in the cart
*/
function upsertCartItems (itemId) {
    const userCartItems = getCartItems();

    if (userCartItems == null) {
        Swal.fire("You must login first to execute this action!");
        return;
    }

    let itemIndex = userCartItems.findIndex(userCartItem => userCartItem.id == itemId);
    let itemBeingSoldInformation = itemsBeingSold.find(itemBeingSold => itemBeingSold.id == itemId);

    if (userCartItems.length == 0) {
        userCartItems.push(
            { id: itemId, itemCount: 1 }
        );

        insertTransactionLog(transactionType.addToCart, itemId);

        Swal.fire({
            imageUrl: itemBeingSoldInformation.imagePath,
            imageAlt: itemBeingSoldInformation.name,
            text: "Item added to cart successfully!"
        });
    }
    else {
        if (itemIndex == -1) {
            userCartItems.push(
                {id: itemId, itemCount: 1}
            );

            insertTransactionLog(transactionType.addToCart, itemId);

            Swal.fire({
                imageUrl: itemBeingSoldInformation.imagePath,
                imageAlt: itemBeingSoldInformation.name,
                text: "Item added to cart successfully!"
            });
        }
        else {
            userCartItems[itemIndex].itemCount = userCartItems[itemIndex].itemCount + 1;

            insertTransactionLog(transactionType.updateCart, itemId);

            Swal.fire({
                imageUrl: itemBeingSoldInformation.imagePath,
                imageAlt: itemBeingSoldInformation.name,
                text: "Successfully updated your cart!"
            });
        }
    }

    let playerEmail = localStorage.getItem("CurrentLoginEmail");

    let userCartItemsJSONString = JSON.stringify(userCartItems);
    localStorage.setItem(`${ playerEmail }CartItems`, userCartItemsJSONString);
}

// Clear out cart items
function clearCartItems () {
    let playerEmail = localStorage.getItem("CurrentLoginEmail");

    let userCartItemsJSONString = JSON.stringify([]);
    localStorage.setItem(`${ playerEmail }CartItems`, userCartItemsJSONString);
}

// Setup items being sold
function initializeItemsBeingSoldToContainer() {
    const itemsBeingSoldContainer = document.getElementById('items-being-sold');
    itemsBeingSold.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('box');
        div.innerHTML = `
            <a href="#" class="fas fa-heart"></a> 
            <a href="#" class="fas fa-eye"></a>
            <img class="img" src="${ item.imagePath }">
            <h3>${ item.name }</h3>
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
            </div>
            <span>₱${ addCommasToNumber(item.price) }</span>
            <button class="btn" data-id="${ item.id }">Add to Cart</button>
        `;
        itemsBeingSoldContainer.appendChild(div);
    })
}

// Setup add to cart button's functionality
function initializeAddToCartListener() {
    const buyButtons = document.querySelectorAll('.btn');

    buyButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            const itemId = button.getAttribute("data-id");
            upsertCartItems(itemId);
        });
    });
}

// Setup cart items
function initializeCartItems() {
    const cartTable = document.getElementById("carts-table");

    const userCartItems = getCartItems();

    if (userCartItems.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td 
                colspan="4" 
                class="empty-cart">Cart empty. Maybe try adding one!
            </td>`;
        cartTable.appendChild(tr);
        return;
    }

    const mergeCartItemsToItemsBeingSold = userCartItems.map(userCartItem => {
        const matchCartItemFromItemsBeingSold = itemsBeingSold.find(
            itemBeingSold => itemBeingSold.id == userCartItem.id
        );
        return {
            ...userCartItem, 
            ...matchCartItemFromItemsBeingSold
        };
    });

    mergeCartItemsToItemsBeingSold.forEach(mergeCartItemToItemsBeingSold => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="item-container">
                    <div>
                        <p>${ mergeCartItemToItemsBeingSold.name }</p>
                    </div>
                    <img 
                        class="img" 
                        src="${mergeCartItemToItemsBeingSold.imagePath}" 
                        alt="${mergeCartItemToItemsBeingSold.name}">
                </div>
            </td>
            <td>₱${ addCommasToNumber(mergeCartItemToItemsBeingSold.price) }</td>
            <td>${ mergeCartItemToItemsBeingSold.itemCount }</td>
            <td>₱${ addCommasToNumber(mergeCartItemToItemsBeingSold.price * mergeCartItemToItemsBeingSold.itemCount) }</td>
        `;
        cartTable.appendChild(tr);
    });
}

// Setup cart action buttons (e.g. Checkout, Clear Cart)
function initializeCartActionButtonsListener() {
    const userCartItems = getCartItems();
    const cartActionButtons = document.getElementById("cart-action-buttons");
    const checkoutButton = document.getElementById("check-button");
    const clearCartButton = document.getElementById("clear-cart-button");

    if (userCartItems.length == 0) {
        cartActionButtons.style.display = "none";
        return;
    }

    checkoutButton.addEventListener("click", function() {
        insertTransactionLog(transactionType.checkoutCart, null);
        window.location.href = "checkout.html";
    });

    clearCartButton.addEventListener("click", function() {
        insertTransactionLog(transactionType.clearCart, null);
        clearCartItems();
        window.location.reload();
    });
}

// Setup place order button functionality
function initializePlaceOrderButtonListener() {
    const placeOrderButton = document.getElementById("place-order-button");

    placeOrderButton.addEventListener('click', function(event) {
        Swal.fire({
            title: "Do you really want to place an order for these items?",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Place Order",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await Swal.fire({
                    icon: "success",
                    title: "Your order has been placed!",
                    showConfirmButton: false,
                    timer: 1500
                });

                insertTransactionLog(transactionType.placeOrder, null);
                clearCartItems();
                window.location.href = "index.html";
            }
        });
    });
}

// Setup number input for payment method
function initializeNumberInputListener(value) {
    const selectedPaymentMethodRadioButtons = document.querySelectorAll('input[type="radio"][name="' + value + '"]');

    selectedPaymentMethodRadioButtons.forEach(function(selectedPaymentMethodRadioButton) {
        selectedPaymentMethodRadioButton.addEventListener('change', function() {
            const selectedValue = document.querySelector('input[type="radio"][name="' + value + '"]:checked').value;
            const registeredPhoneNumberInput = document.getElementById("registered-phone-number-container");
            const referenceNumberInput = document.getElementById("reference-number-container");

            const referenceNumberEnabledItems = [
                'seven-eleven',
                'bpi',
                'ub',
                'bdo',
                'boc'
            ];
            if (referenceNumberEnabledItems.indexOf(selectedValue) == -1) {
                registeredPhoneNumberInput.style.display = 'block';
                referenceNumberInput.style.display = 'none';
            }
            else {
                referenceNumberInput.style.display = 'block';
                registeredPhoneNumberInput.style.display = 'none';
            }
        });
    });
}

// Setup payment methods
function initializeSelectedPaymentMethod () {
    const radioButtons = document.querySelectorAll('input[type="radio"][name="payment-method"]');

    radioButtons.forEach(function(radioButton) {
        radioButton.addEventListener('change', function() {
            const selectedValue = document.querySelector('input[type="radio"][name="payment-method"]:checked').value;

            switch (selectedValue) {
                case "payment-center-e-wallet":
                    initializeNumberInputListener("payment-center-e-wallet-selected");
                    break;
                case "online-banking":
                    initializeNumberInputListener("online-banking-selected");
                    break;
            }

            document.querySelectorAll('.hidden-payment-option').forEach(function(element) {
                element.style.display = 'none';
            });

            const targetElement = document.getElementById(selectedValue + "-container");
            const registeredPhoneNumberInput = document.getElementById("registered-phone-number-container");
            const referenceNumberInput = document.getElementById("reference-number-container");

            if (targetElement) {
                console.log(targetElement);
                targetElement.style.display = 'block';

                if (lastSelectedPaymentMethod != "" || lastSelectedPaymentMethod != selectedValue) {
                    var radios = document.getElementsByName(lastSelectedPaymentMethod + "-selected");
                    if (radios.length > 0) {
                        for (var i = 0; i < radios.length; i++) {
                            radios[i].checked = false;
                        }
                    }
                    lastSelectedPaymentMethod = selectedValue;
                }

                registeredPhoneNumberInput.style.display = 'none';
                referenceNumberInput.style.display = 'none';
            }
        });
    });
}

// Setup order summary
function initializeSummary() {
    const merchandiseTotalElement = document.getElementById("merchandise-total");
    const shippingTotalElement = document.getElementById("shipping-total");
    const handingFeeElement = document.getElementById("handing-fee");
    const totalPaymentElement = document.getElementById("total-payment");

    const userCartItems = getCartItems();

    const mergeCartItemsToItemsBeingSold = userCartItems.map(userCartItem => {
        const matchCartItemFromItemsBeingSold = itemsBeingSold.find(
            itemBeingSold => itemBeingSold.id == userCartItem.id
        );
        return {...userCartItem, ...matchCartItemFromItemsBeingSold};
    });

    const totalMerchandisePrice = mergeCartItemsToItemsBeingSold.reduce((accumulator, currentItem) => {
        return accumulator + (currentItem.price * currentItem.itemCount);
    }, 0);

    const totalPayment = totalMerchandisePrice + 
                            checkoutFees.handingFeePerIndividualItem + 
                            checkoutFees.shippingTotalPerIndividualItem;

    merchandiseTotalElement.textContent = "₱" + addCommasToNumber(totalMerchandisePrice);
    shippingTotalElement.textContent = "₱" + addCommasToNumber(checkoutFees.shippingTotalPerIndividualItem);
    handingFeeElement.textContent = "₱" + addCommasToNumber(checkoutFees.handingFeePerIndividualItem);
    totalPaymentElement.textContent = "₱" + addCommasToNumber(totalPayment);
}

function insertTransactionLog(transactionType, itemId) {
    /*
        Transaction columns:
        Transaction Description (ex. Added item to cart)
        Transaction Type (ex. Add to cart)
        Transaction Date and Time (ex. March 30, 2024 11:10:00 AM)
    */

    const userTransactionLogs = getTransactionLogs();
    let currentDateTime = getCurrentDateTime();

    let transactionLogItem = {
        description: transactionType.description, 
        type: transactionType.type, 
        datetime: currentDateTime
    }

    if (itemId != null){
        transactionLogItem.itemId = itemId
    }

    userTransactionLogs.push(transactionLogItem);

    let playerEmail = localStorage.getItem("CurrentLoginEmail");
    let userTransactionLogsJSONString = JSON.stringify(userTransactionLogs);

    localStorage.setItem(`${ playerEmail }TransactionData`, userTransactionLogsJSONString);
}

function getTransactionLogs() {
    const playerEmail = localStorage.getItem("CurrentLoginEmail");

    if (playerEmail == null) {
        return null;
    }

    let transactionLogsString = localStorage.getItem(`${ playerEmail }TransactionData`);

    if (transactionLogsString) {
        let transactionLogs = JSON.parse(transactionLogsString);
        return transactionLogs;
    }
    else {
        return [];
    }
}


function initializeTransactionLogs() {
    const transactionTable = document.getElementById("transaction-table");

    const userTransactionLogs = getTransactionLogs();

    if (userTransactionLogs.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" class="empty-cart">Transaction empty. Maybe try doing something!</td>`;
        transactionTable.appendChild(tr);
        return;
    }

    const transactionLogItems = userTransactionLogs.map(userTransactionLog => {
        let formattedTransactionLogItem = {
            type: userTransactionLog.type,
            datetime: userTransactionLog.datetime
        };

        if (userTransactionLog.hasOwnProperty('itemId')) {
            let itemInformation = itemsBeingSold.find(
                itemBeingSold => itemBeingSold.id == userTransactionLog.itemId
            );
            let description = 
                userTransactionLog.description + " : " + itemInformation.name + "\n" + 
                "Item Price : ₱" + addCommasToNumber(itemInformation.price)

            formattedTransactionLogItem.description = description;
        }
        else {
            formattedTransactionLogItem.description = userTransactionLog.description;
        }

        return formattedTransactionLogItem;
    })

    transactionLogItems.forEach(transactionLogItem => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ transactionLogItem.type }</td>
            <td>${ transactionLogItem.description }</td>
            <td>${ transactionLogItem.datetime }</td>
        `;
        transactionTable.appendChild(tr);
    });
}