import { LightningElement, track, wire } from 'lwc';
import saveHours from '@salesforce/apex/WorkLogController.saveHours'; // Import Apex method
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Toast utility for notifications
import { publish, MessageContext } from 'lightning/messageService'; // Message service to communicate with other components
import HOUR_TRACKER_MESSAGE_CHANNEL from '@salesforce/messageChannel/HourTrackerMessageChannel__c'; // Message channel for communication

export default class HourTracker extends LightningElement {
    // Tracks for the date and hours input
    @track sundayDate; 
    @track showTable = false;
    @track sundayHours = 0;
    @track mondayHours = 0;
    @track tuesdayHours = 0;
    @track wednesdayHours = 0;
    @track thursdayHours = 0;
    @track fridayHours = 0;
    @track saturdayHours = 0;

    // Injects the message context from Lightning Message Service
    @wire(MessageContext)
    messageContext;

    /**
     * Handles the change of date input for Sunday.
     * Ensures that the selected date is a Sunday; otherwise, it displays an error message.
     * 
     * @param {Event} event - The input event containing the selected date
     */
    handleDateChange(event) {
        const selectedDate = new Date(event.target.value); // Get selected date
        const dayOfWeek = selectedDate.getDay(); // Determine the day of the week (0 = Sunday)
        
        if (dayOfWeek !== 6) { // If the selected day is not Sunday
            this.showTable = false; // Hide the hours input table
            this.showToast('Invalid Date', 'Please select a Sunday date.', 'error'); // Show error toast
            this.sundayDate = ''; // Clear the input field
        } else {
            this.sundayDate = event.target.value; // Store the valid Sunday date
            this.showTable = true; // Show the table for entering hours
        }
    }

    /**
     * Handles input changes for the hours fields.
     * Updates the corresponding day’s hours based on user input.
     * 
     * @param {Event} event - The input event containing hours data
     */
    handleInputChange(event) {
        const day = event.target.dataset.id; // Identify which day's hours are being modified
        const value = event.target.value; // Get the entered hours value

        // Update the respective day's hours
        if (day === 'sunday') {
            this.sundayHours = value;
        } else if (day === 'monday') {
            this.mondayHours = value;
        } else if (day === 'tuesday') {
            this.tuesdayHours = value;
        } else if (day === 'wednesday') {
            this.wednesdayHours = value;
        } else if (day === 'thursday') {
            this.thursdayHours = value;
        } else if (day === 'friday') {
            this.fridayHours = value;
        } else if (day === 'saturday') {
            this.saturdayHours = value;
        }
    }

    /**
     * Handles form submission to save the entered hours data.
     * Prepares the hour data and sends it to the Apex controller for saving.
     */
    handleSubmit() {
        const hourData = {
            sundayDate: this.sundayDate, // Sunday starting date
            sundayHours: this.sundayHours,
            mondayHours: this.mondayHours,
            tuesdayHours: this.tuesdayHours,
            wednesdayHours: this.wednesdayHours,
            thursdayHours: this.thursdayHours,
            fridayHours: this.fridayHours,
            saturdayHours: this.saturdayHours
        };

        // Call the Apex method to save the hours data
        saveHours({ hourTrackerData: hourData })
            .then(() => {
                this.showToast('Success', 'Hours saved successfully!', 'success'); // Show success toast
                this.publishRefreshMessage(); // Notify other components to refresh their data
                
                this.resetForm(); // Reset form fields after successful save
                this.showTable = false; // Hide the hours input table
            })
            .catch(error => {
                this.showToast('Error', 'Error logging hours: ' + error.body.message, 'error'); // Show error toast
            });
    }

    /**
     * Publishes a refresh message to other components listening to the message channel.
     */
    publishRefreshMessage() {
        publish(this.messageContext, HOUR_TRACKER_MESSAGE_CHANNEL, { refresh: true }); // Publish refresh event
    }

    /**
     * Resets the form by clearing the date and hours fields after a successful submission.
     */
    resetForm() {
        this.sundayDate = null; // Reset the date field
        this.sundayHours = 0;
        this.mondayHours = 0;
        this.tuesdayHours = 0;
        this.wednesdayHours = 0;
        this.thursdayHours = 0;
        this.fridayHours = 0;
        this.saturdayHours = 0;
    }

    /**
     * Displays a toast notification to the user.
     * 
     * @param {String} title - The title of the toast message
     * @param {String} message - The message content of the toast
     * @param {String} variant - The variant of the toast (e.g., 'success', 'error')
     */
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt); // Dispatch the toast event to show the notification
    }
}
