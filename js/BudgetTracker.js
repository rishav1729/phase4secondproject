export default class BudgetTracker {
    constructor(querySelectorString) {
        this.root = document.querySelector(querySelectorString);
        this.root.innerHTML = BudgetTracker.html();//this.root.innerHTML is going to be equal to budget tracker.html so we're going to take the html string from this method here and simply inject it inside our app

        this.root.querySelector(".new-entry").addEventListener("click", () => {
            this.onNewEntryBtnClick();
        });

        // Load initial data from Local Storage
        this.load();
    }
    // This html method is going to return the html for the actual table itself 
    static html() {
        //This is the main table for budget tracker
        //line 25  keeping a fifth row available just for the for the delete entry button
        return `
            <table class="budget-tracker">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th></th>       
                    </tr>
                </thead>
                <tbody class="entries"></tbody>
                <tbody>
                    <tr>
                        <td colspan="5" class="controls">
                            <button type="button" class="new-entry">New Entry</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <strong>Remaining Fund:</strong>
                            <span class="total">$0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
    }
    // This entryhtml method is going to return the html string for a single row inside that table 
    static entryHtml() {
        //second class of input dash dates the reason for the second class here is so we can then access this input field from within the javascript code 
        return `
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Add a Description (e.g. wages, bills, etc.)">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="fund/budget">fund/budget</option>
                        <option value="cost">Cost</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount">
                </td>
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td>
            </tr>
        `;
    }
    //load method will be the initial loading of the data 
    load() {
        const entries = JSON.parse(localStorage.getItem("budget-tracker-entries-dev") || "[]");

        for (const entry of entries) {
            this.addEntry(entry);
        }

        this.updateSummary();
    }
    //updatesummary method one here is going to take all of the current rows in the table and work out the total amount and display it in the bottom right corner 
    updateSummary() {
        const total = this.getEntryRows().reduce((total, row) => {
            const amount = row.querySelector(".input-amount").value;
            const isCost = row.querySelector(".input-type").value === "cost";
            const modifier = isCost ? -1 : 1;

            return total + (amount * modifier);
        }, 0);

        const totalFormatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(total);

        this.root.querySelector(".total").textContent = totalFormatted;
    }
    //save methos id  going to take all the data and save it to local storage so it can be persisted when you refresh the page 
    save() {
        const data = this.getEntryRows().map(row => {
            return {
                date: row.querySelector(".input-date").value,
                description: row.querySelector(".input-description").value,
                type: row.querySelector(".input-type").value,
                amount: parseFloat(row.querySelector(".input-amount").value),
            };
        });

        localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
        this.updateSummary();
    }
    //add entry method is going to take in a entry as an object so more on this later on but it's going to have a default value of an empty object just like that and basically this method add entry is going to add a new entry inside the table 
    addEntry(entry = {}) {
        this.root.querySelector(".entries").insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

        const row = this.root.querySelector(".entries tr:last-of-type");

        row.querySelector(".input-date").value = entry.date || new Date().toISOString().replace(/T.*/, "");
        row.querySelector(".input-description").value = entry.description || "";
        row.querySelector(".input-type").value = entry.type || "fund/budget";
        row.querySelector(".input-amount").value = entry.amount || 0;
        row.querySelector(".delete-entry").addEventListener("click", e => {
            this.onDeleteEntryBtnClick(e);
        });

        row.querySelectorAll(".input").forEach(input => {
            input.addEventListener("change", () => this.save());
        });
    }
    //getEntryRows method is going to basically be a little helper for us to return all of the active rows or all of the rows inside the table or the entries
    getEntryRows() {
        return Array.from(this.root.querySelectorAll(".entries tr"));
    }
    //onNewEntryBtnClick method is going to run of course it's going to then add a new entry 
    onNewEntryBtnClick() {
        this.addEntry();
    }
    //delete delete entry btn click this one here is going to be taking through the event object and basically it's going to do something when the user clicks on the little x to delete an entry 
    onDeleteEntryBtnClick(e) {
        e.target.closest("tr").remove();
        this.save();
    }
}