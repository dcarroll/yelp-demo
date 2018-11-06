import { Element, api, wire, track } from 'engine';
// import  *  as leaflet from 'c-leaflet';
import getListByAddress from '@salesforce/apex/YelpServiceController.getListByAddress';
import { getRecord } from 'lightning-ui-api-record';
import { showNotice } from 'lightning-notifications-library';

export default class YelpDemo extends Element {
    @api recordId;
    @api designHeight;
    @track sobjectLocation;
    @api staticLocation;
    @api openItem;
    @api searchTerm;
    @api address;
    @api errorMessage;
    @api map;
    @api isLoaded = false;
    @api fields;
    @track sObjectName;
    @api restaurantList = [];
    @track record;

    @api mapMarkers = [];
    @api zoomLevel;
    @api mapCenter;
    get showMap() {
        return this.mapMarkers.length > 0;
    }

    smap = false;

    @api selectedItem;

    objectType;
    rendered = false;

    @wire(getRecord, { recordId: '$recordId', fields: '$fields' })
    wiredRecord({ error, data }) {
        if (error) {
            this.errorMessage = JSON.stringify(error, null, 4);
        } else {
            if (typeof data !== 'undefined') {
                this.record = JSON.parse(JSON.stringify(data));
                const fieldValueArray = [];
                for (let i = 0; i < this.fields.length; i++) {
                    fieldValueArray.push(this.record.fields[this.fields[i].split('.')[1]].value);
                }

                this.sobjectLocation = fieldValueArray.join(',');
            }
        }
    }

    @wire(getListByAddress, { address: '$sobjectLocation', searchTerm: '$searchTerm' })
    wiredYelpSearch({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            this.handleYelpData(data);
        }
    }

    constructor() {
        super();
        this.template.addEventListener('notification', this.handleCardNotification.bind(this));
    }

    connectedCallback() {
        this.deriveObjectNameFromPrefixHack(this.recordId)
            .then(objName => {
                this.sObjectName = objName;
            })
            .then(() => {
                this.fields = this.getFieldListFromSObjectName();
            });
    }

    getFieldListFromSObjectName() {
        let fList;
        switch (this.sObjectName) {
            case 'Contact':
                fList = ['Contact.MailingStreet', 'Contact.MailingCity', 'Contact.MailingState'];
                break;
            case 'Account':
                fList = ['Account.BillingStreet', 'Account.BillingCity', 'Account.BillingState'];
                break;
            default:
                break;
        }
        return fList;
    }

    async deriveObjectNameFromPrefixHack(sobjectId) {
        const prefix = sobjectId.substring(0, 3);
        const prefixMap = {
            '001': 'Account',
            '002': 'Note',
            '003': 'Contact',
            '005': 'User',
            '006': 'Opportunity',
            '008': 'OpportunityHistory',
            '100': 'UserLicense',
            '101': 'Custom Label',
            '400': 'ApexClassMember',
            '500': 'Case',
            '501': 'Solution',
            '608': 'ForecastShare',
            '701': 'Campaign',
            '707': 'AsyncApexJob',
            '709': 'ApexTestQueueItem',
            '750': 'Bulk Query Job',
            '751': 'Bulk Query Batch',
            '752': 'Bulk Query Result',
            '800': 'Contract',
            '806': 'Approval',
            '888': 'Remote Access',
            '000': 'Empty Key',
            '00a': 'CaseComment/IdeaComment',
            '00b': 'WebLink',
            '00B': 'View',
            '00D': 'Organization',
            '00e': 'Profile',
            '00E': 'UserRole',
            '00G': 'Group',
            '00h': 'Page Layout',
            '00I': 'Partner',
            '00J': 'OpportunityCompetitor',
            '00K': 'OpportunityContactRole',
            '00k': 'OpportunityLineItem',
            '00l': 'Folder',
            '00N': 'Custom Field Definition',
            '00o': 'OpportunityLineItemSchedule',
            '00O': 'Report',
            '00P': 'Attachment',
            '00p': 'UserTeamMember',
            '00Q': 'Lead',
            '00q': 'OpportunityTeamMember',
            '00r': 'AccountShare',
            '00S': 'Import Queue',
            '00t': 'OpportunityShare',
            '00T': 'Task',
            '00U': 'Event',
            '00v': 'CampaignMember',
            '00X': 'EmailTemplate',
            '010': 'CaseSolution',
            '011': 'GroupMember',
            '012': 'RecordType',
            '015': 'Document',
            '016': 'BrandTemplate(Letterhead)',
            '018': 'EmailStatus',
            '019': 'BusinessProcess',
            '01a': 'DashboardComponent',
            '01D': 'UserAccountTeamMember',
            '01H': 'MailmergeTemplate',
            '01I': 'Custom Object',
            '01m': 'BusinessHours',
            '01M': 'AccountTeamMember',
            '01n': 'CaseShare',
            '01N': 'Scontrol',
            '01o': 'LeadShare',
            '01p': 'ApexClass',
            '01r': 'Visualforce Tab',
            '01s': 'Pricebook2',
            '01t': 'Product2',
            '01u': 'PricebookEntry',
            '01Y': 'CampaignMemberStatus',
            '01Z': 'Dashboard',
            '020': 'EventAttendee',
            '021': 'QuantityForecast',
            '022': 'FiscalYearSettings',
            '026': 'Period',
            '027': 'RevenueForecast',
            '028': 'OpportunityOverride',
            '029': 'LineitemOverride',
            '02a': 'ContractContactRole',
            '02c': 'Sharing Rule',
            '02i': 'Asset',
            '02n': 'CategoryNode',
            '02o': 'CategoryData',
            '02s': 'EmailMessage',
            '02Z': 'AccountContactRole',
            '033': 'Package',
            '035': 'SelfServiceUser',
            '03d': 'Validation Rule',
            '03g': 'QueueSobject',
            '03j': 'CaseContactRole',
            '03s': 'ContactShare',
            '03u': 'UserPreference',
            '04g': 'ProcessInstance',
            '04h': 'ProcessInstanceStep',
            '04i': 'ProcessInstanceWorkitem',
            '04k': 'Outbound Message Id',
            '04l': 'Outbound Notification Id',
            '04m': 'AdditionalNumber',
            '04s': 'AsyncResult/DeployResult',
            '04t': 'Install Package',
            '04v': 'CallCenter',
            '04W': 'RevenueForecastHistory',
            '04X': 'QuantityForecastHistory',
            '04Y': 'Field Update',
            '058': 'ContentWorkspace',
            '059': 'ContentWorkspaceDoc',
            '05X': 'DocumentAttachmentMap',
            '060': 'Portal Id',
            '066': 'ApexPage',
            '068': 'ContentVersion',
            '069': 'ContentDocument',
            '07E': 'Sandbox',
            '07L': 'ApexLog',
            '081': 'StaticResource',
            '082': 'Data from Uninstalled Packages',
            '083': 'Vote',
            '087': 'Idea',
            '08e': 'CronTrigger',
            '08s': 'CampaignShare',
            '091': 'EmailServicesFunction',
            '092': 'Weekly Data Export',
            '093': 'EmailServicesAddress',
            '099': 'ApexComponent',
            '09a': 'Community',
            '0A2': 'Change Set',
            '0A3': 'Installed Package',
            '0BM': 'Connection – Salesforce to Salesforce',
            '0C0': 'Holiday',
            '0D2': 'OrgWideEmailAddress',
            '0DM': 'Site',
            '0E8': 'EntitySubscription',
            '0EP': 'Inbound Change Set',
            '0J0': 'SetupEntityAccess',
            '0PS': 'Permission Set Metadata',
            '0Q0': 'Quote',
            '0t0': 'TagDefinition',
            '0Ya': 'LoginHistory',
            '1dc': 'MetadataContainer',
            '1dr': 'ContainerAsyncRequest',
            '7tf': 'TraceFlag',
        };
        return prefixMap[prefix];
    }

    async getYelpDataByLatLon(searchTerm, latlon) {
        await this.getListByLatLon({ latlon: latlon, searchTerm: searchTerm })
            .then(results => {
                this.handleYelpData(results);
            })
            .catch(error => {
                this.errorMessage = error.toString();
            });
    }

    handleYelpData = data => {
        const jsonData = JSON.parse(data);
        if (jsonData.bizArray) {
            this.staticLocation = jsonData.location;
            this.restaurantList = jsonData.bizArray;
        }
        this.hideSpinner();
    };

    getBrowserLocation = () => {
        navigator.geolocation.getCurrentPosition(
            function() {
                // this.isLoaded = false;
                // this.getYelpData(this.searchTerm, undefined, e.coords.latitude + ',' + e.coords.longitude);
            },
            function() {
                this.errorMessage = 'Could not get your current geolocation.';
            },
        );
    };

    updateSearch = event => {
        if (event.keyCode === 13) {
            this.searchTerm = event.target.value;
        }
    };

    showSpinner() {
        this.isLoaded = false;
    }

    hideSpinner = () => {
        this.isLoaded = true;
    };

    /*initializeLayout = () => {
        if (this.recordId) {
            this.unfixMain();
        } else {
            this.fixScrollArea();
            this.hideSpinner();
            navigator.geolocation.getCurrentPosition(
                function(e) {
                    this.sobjectLocation = e;
                },
                function() {
                    this.errorMessage = 'Could not get your current geolocation.';
                    // TODO -- Next two lines need migrating.
                    // var warning = component.find('warning');
                    // $A.util.removeClass(warning, 'slds-hide');
                },
            );
        }
    };*/

    unfixMain = () => {
        const main = this.template.querySelector('#main');
        main.classList.remove('small');
        main.classList.add(this.designHeight);
    };

    fixScrollArea = () => {
        const main = this.template.querySelector('#main');
        main.classList.remove('small');
        main.classList.remove(this.designHeight);
        main.classList.add('autoHeight');
        const scrollableArea = this.template.querySelector('#scrollableArea');
        scrollableArea.classList.remove('scroll-container');
        scrollableArea.classList.remove('slds-scrollable--y');
    };

    handleShowToast = () => {
        showNotice({
            header: 'Notif library Success!',
            message: JSON.stringify(this.mapMarkers[0], null, 4),
        });
    };

    // TODO - leaflet, for some reason, can't be created as a shared javascript library
    // like the c-utils example in the lightning components doc.  Need to wait for support
    // for using javascript libraries from static resources.
    revealDetailsPane = data => {
        this.selectedItem = data;
        let jsonData = JSON.parse(JSON.stringify(data));

        const description = Object.values(jsonData.category)
            .map(field => {
                return field.title;
            })
            .join(' - ');

        const mapLocation = {
            location: { Street: data.address, City: data.city, State: data.state },
            title: data.name,
            description: description,
        };

        this.mapMarkers = [mapLocation];
        this.zoomLevel = 15;

        const panelList = this.template.querySelector('#panelList');
        const panelDetails = this.template.querySelector('#panelDetails');
        panelList.classList.add('panel--stageRight');
        panelDetails.classList.remove('panel--stageRight');
        this.updateSelectedItemDetails(data);
    };

    updateSelectedItemDetails(data) {
        this.itemName = data.name;
        this.address = data.address;
        this.city = data.city;
        this.state = data.state;
        this.phone = data.phone;
        this.image = data.image;
        this.review = data.review;
    }

    handleCardNotification(evt) {
        if (evt.type === 'itemselected') {
            this.revealDetailsPane(evt.detail);
        }
    }

    showDetails = (component, event) => {
        this.revealDetailsPane(component, event);
    };

    handleBackButton = () => {
        var panelList = this.template.querySelector('#panelList');
        var panelDetails = this.template.querySelector('#panelDetails');
        panelList.classList.remove('panel--stageRight');
        panelList.classList.remove('slds-hide');
        panelDetails.classList.remove('panel--visible');
        panelDetails.classList.add('panel--stageRight');
        this.mapMarkers = [];
    };

    rerender = () => {
        // TODO waiting on the leaflet compatibility stuff above.
        /* var nodes = this.superRerender();
        if (!window.L) return nodes;
        var map = component.get("v.map");
        if (!map) {
            var mapElement = component.find("map").getElement();
            map = window.L.map(mapElement, {zoomControl: true}).setView([37.784173, -122.401557], 14);
            window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            {attribution: 'Tiles © Esri'}).addTo(map);
            component.set("v.map", map);
            var markers = new window.L.FeatureGroup();
            component.set("v.markers", markers);
        }
        return nodes;*/
    };
}
