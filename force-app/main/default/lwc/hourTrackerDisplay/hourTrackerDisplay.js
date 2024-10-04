import { LightningElement, wire, track } from 'lwc';
import getAllHours from '@salesforce/apex/HourTrackerController.getAllHours';
import { refreshApex } from '@salesforce/apex'; // Import refreshApex to allow for refreshing data
import { subscribe, MessageContext } from 'lightning/messageService'; // Import message service utilities
import HOUR_TRACKER_MESSAGE_CHANNEL from '@salesforce/messageChannel/HourTrackerMessageChannel__c';

export default class HourTrackerDisplay extends LightningElement {
    @track hoursData = []; // Holds the hours data to be displayed in the table
    wiredHoursResult; // Stores the result of the wire method to refresh later
    // Defines the columns for the lightning-datatable
    columns = [
        { label: 'Week Starting', fieldName: 'sundayDate', type: 'date' }, // Displays the week starting date (Sunday)
        { label: 'Sunday Hours', fieldName: 'sundayHours', type: 'number' },
        { label: 'Monday Hours', fieldName: 'mondayHours', type: 'number' },
        { label: 'Tuesday Hours', fieldName: 'tuesdayHours', type: 'number' },
        { label: 'Wednesday Hours', fieldName: 'wednesdayHours', type: 'number' },
        { label: 'Thursday Hours', fieldName: 'thursdayHours', type: 'number' },
        { label: 'Friday Hours', fieldName: 'fridayHours', type: 'number' },
        { label: 'Saturday Hours', fieldName: 'saturdayHours', type: 'number' }
    ];

    // Injects the Lightning Message Service context to facilitate message handling
    @wire(MessageContext)
    messageContext;

    /**
     * Lifecycle hook: Runs when the component is inserted into the DOM
     * Subscribes to the message channel to listen for any updates
     */
    connectedCallback() {
        this.subscribeToMessageChannel(); // Initiates message channel subscription
    }

    /**
     * Subscribes to the HourTracker message channel to listen for refresh requests
     * When a message is received, the `handleMessage` method is triggered
     */
    subscribeToMessageChannel() {
        subscribe(this.messageContext, HOUR_TRACKER_MESSAGE_CHANNEL, (message) => {
            this.handleMessage(message); // Process the received message
        });
    }

    /**
     * Handles the received message from the message channel
     * If the message contains a refresh flag, it triggers a data refresh
     * 
     * @param {Object} message - The message payload from the message channel
     */
    handleMessage(message) {
        if (message.refresh) {
            this.refreshData(); // Calls the method to refresh the wire data
        }
    }

    /**
     * Wire method to retrieve all logged hours from the Apex controller
     * The result is stored in `wiredHoursResult` for future refreshes
     * On success, the result is mapped to the `hoursData` property
     * 
     * @param {Object} result - The result object from the wire service
     */
    @wire(getAllHours)
    wiredHours(result) {
        this.wiredHoursResult = result; // Stores the result to allow refreshing
        if (result.data) {
            // Maps the data to the format needed for the lightning-datatable
            this.hoursData = result.data.map(record => ({
                id: record.Id, // Unique identifier for each record
                sundayDate: record.Sunday_Date__c, // Start of the week (Sunday)
                sundayHours: record.Sunday_Hours__c, // Hours logged for Sunday
                mondayHours: record.Monday_Hours__c, // Hours logged for Monday
                tuesdayHours: record.Tuesday_Hours__c, // Hours logged for Tuesday
                wednesdayHours: record.Wednesday_Hours__c, // Hours logged for Wednesday
                thursdayHours: record.Thursday_Hours__c, // Hours logged for Thursday
                fridayHours: record.Friday_Hours__c, // Hours logged for Friday
                saturdayHours: record.Saturday_Hours__c // Hours logged for Saturday
            }));
        } else if (result.error) {
            // Error handling can be implemented here
            console.error('Error retrieving hours data: ', result.error);
        }
    }

    /**
     * Triggers a refresh of the wire service, which re-fetches the data
     * This method is invoked when a refresh message is received
     */
    refreshData() {
        refreshApex(this.wiredHoursResult); // Refreshes the wired data by re-invoking the wire method
    }
}
