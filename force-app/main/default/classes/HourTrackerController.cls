/**
 * HourTrackerController - Provides methods for fetching HourTracker data.
 *
 * getAllHours(): 
 *   - Retrieves all HourTracker__c records ordered by Sunday date.
 *   - Uses cacheable=true to allow client-side caching for improved performance.
 */
public with sharing class HourTrackerController {

    /**
     * Fetches all HourTracker__c records, including hours for each day.
     * @return List<HourTracker__c> - List of all hour records ordered by Sunday date.
     */
    @AuraEnabled(cacheable=true)
    public static List<HourTracker__c> getAllHours() {
        return [
            SELECT Id, Sunday_Date__c, Sunday_Hours__c, Monday_Hours__c, 
                   Tuesday_Hours__c, Wednesday_Hours__c, Thursday_Hours__c, 
                   Friday_Hours__c, Saturday_Hours__c
            FROM HourTracker__c
            ORDER BY Sunday_Date__c
        ];
    }
}
