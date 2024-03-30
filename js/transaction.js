document.addEventListener("DOMContentLoaded", function() {
    const playerEmail = localStorage.getItem("CurrentLogin");
    let transactions = localStorage.getItem(`${playerEmail}transactionData`) ? localStorage.getItem(`${playerEmail}transactionData`).split(';') : [];

    const transactionTable = document.getElementById('transaction-table');

    if (transactions.length === 0) {
        const row = document.createElement('tr');
        const messageCell = document.createElement('td');
        messageCell.setAttribute('colspan', '4'); // Span across all columns
        messageCell.textContent = "No transaction yet!!";
        row.appendChild(messageCell);
        transactionTable.appendChild(row);
    } else {
        transactions.forEach(transaction => {
            const [date, Time, name, price] = transaction.split(',');

            const row = document.createElement('tr');
            row.classList.add('transaction-row'); // Add a class for styling

            const dateCell = document.createElement('td');
            dateCell.textContent = date;

            const timeCell = document.createElement('td');
            timeCell.textContent = Time;

            const nameCell = document.createElement('td');
            nameCell.textContent = name; // Set the item name

            const priceCell = document.createElement('td');
            priceCell.textContent = price;

            row.appendChild(dateCell);
            row.appendChild(timeCell); // Append the time cell
            row.appendChild(nameCell);
            row.appendChild(priceCell);

            transactionTable.appendChild(row);
        });
    }
});
