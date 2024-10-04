/**
 * WorkLogController - Apex backend controller for the Hour Tracker LWC
 * Provides a method to save hours data for each day of the week.
 * 
 * saveHours(Map<String, Object> hourTrackerData): 
 *   - Accepts a map of hour data and saves it into a custom HourTracker__c object.
 *   - Ensures no duplicate record is created for the same Sunday date.
 *   - Throws an exception if a record for the selected Sunday already exists.
 */
public with sharing class WorkLogController {
    
    /**
     * saveHours - Method to save the logged hours for a given week
     * @param hourTrackerData - A map containing the hours for each day and the starting Sunday date.
     * @throws AuraHandledException if a record already exists for the given Sunday date.
     */
    @AuraEnabled
    public static void saveHours(Map<String, Object> hourTrackerData) {
        try {
            // Parse the Sunday date from the map, adjusting for date format differences
            Date sundayDate = Date.valueOf((String) hourTrackerData.get('sundayDate')).addDays(1);

            // Query for any existing records with the same Sunday date
            List<HourTracker__c> existingRecords = [
                SELECT Id 
                FROM HourTracker__c 
                WHERE Sunday_Date__c = :sundayDate
            ];

            // If a record already exists for this Sunday, throw a custom error
            if (!existingRecords.isEmpty()) {
                throw new AuraHandledException('A record for this date already exists. Please choose a different date.');
            }

            // Create a new HourTracker__c record and populate it with the provided data
            HourTracker__c hourTracker = new HourTracker__c();
            hourTracker.Sunday_Date__c = sundayDate;
            hourTracker.Sunday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('sundayHours')));
            hourTracker.Monday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('mondayHours')));
            hourTracker.Tuesday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('tuesdayHours')));
            hourTracker.Wednesday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('wednesdayHours')));
            hourTracker.Thursday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('thursdayHours')));
            hourTracker.Friday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('fridayHours')));
            hourTracker.Saturday_Hours__c = Decimal.valueOf(String.valueOf(hourTrackerData.get('saturdayHours')));

            // Insert the newly created record into the database
            insert hourTracker;
        } catch (AuraHandledException e) {
            // Re-throw AuraHandledException if already caught
            throw e;
        } catch (Exception e) {
            // Handle all other exceptions and throw them as AuraHandledException
            throw new AuraHandledException(e.getMessage());
        }
    }
}
