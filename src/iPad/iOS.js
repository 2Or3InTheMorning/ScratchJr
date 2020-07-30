import {
    isiOS,
    gn
} from '../utils/lib';
import IO from './IO';
import Lobby from '../lobby/Lobby';
import Alert from '../editor/ui/Alert';
import ScratchAudio from '../utils/ScratchAudio';
import Web from './Web';
import WebUtils from './WebUtils';

//////////////////////////////////////////////////
//  Tablet interface functions
//////////////////////////////////////////////////

// This file and object are named "iOS" for legacy reasons.
// But, it is also used for the AndroidInterface. All function calls here
// are mapped to Android/iOS native calls.

let path;
let camera;
let database = 'projects';
let mediacounter = 0;
let tabletInterface = null;

export default class iOS {
    // Getters/setters for properties used in other classes
    static get path() {
        return path;
    }

    static set path(newPath) {
        path = newPath;
    }

    static get camera() {
        return camera;
    }

    static get database() {
        return database;
    }

    // Wait for the tablet interface to be injected into the webview
    static waitForInterface(fcn) {
        // Already loaded the interface
        if (tabletInterface != null) {
            fcn();
            return;
        }

        if (WebUtils.isWeb()) {
            // AndroidInterface = null;
            tabletInterface = Web;
            Web.init();
            if (fcn) {
                fcn();
            }
            return;
        }

        // Android device
        if (typeof AndroidInterface !== 'undefined') {
            tabletInterface = AndroidInterface;
            if (fcn) {
                fcn();
            }
            return;
        }

        // iOS device - might not be loaded yet
        if (typeof (window.tablet) != 'object') {
            // Come back in 100ms
            setTimeout(function () {
                iOS.waitForInterface(fcn);
            }, 100);
        } else {
            // All set to run commands
            tabletInterface = window.tablet;
            if (fcn) {
                fcn();
            }
        }
    }

    // Database functions
    static stmt(json, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.database_stmt(JSON.stringify(json), fcn);
        } else {
            var result = tabletInterface.database_stmt(JSON.stringify(json));
            if (typeof (fcn) !== 'undefined') {
                fcn(result);
            }
        }
    }

    static query(json, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.database_query(JSON.stringify(json), fcn);
        } else {
            var result = tabletInterface.database_query(JSON.stringify(json));
            if (typeof (fcn) !== 'undefined') {
                fcn(result);
            }
        }
    }

    static setfield(db, id, fieldname, val, fcn) {
        var json = {};
        var keylist = [fieldname + ' = ?', 'mtime = ?'];
        json.values = [val, (new Date()).getTime().toString()];
        json.stmt = 'update ' + db + ' set ' + keylist.toString() + ' where id = ' + id;
        iOS.stmt(json, fcn);
    }

    // IO functions
    static cleanassets(ft, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_cleanassets(ft, fcn);
        } else {
            tabletInterface.io_cleanassets(ft);
            fcn();
        }
    }

    static getmedia(file, fcn) {
        mediacounter++;
        var nextStep = function (file, key, whenDone) {
            if (WebUtils.isWeb()) {
                tabletInterface.io_getmedialen(file, key, function (result) {
                    iOS.processdata(key, 0, result, '', whenDone);
                });
            } else {
                var result = tabletInterface.io_getmedialen(file, key);
                iOS.processdata(key, 0, result, '', whenDone);
            }
        };
        nextStep(file, mediacounter, fcn);
    }

    static getmediadata(key, offset, len, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_getmediadata(key, offset, len, fcn);
        } else {
            var result = tabletInterface.io_getmediadata(key, offset, len);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static processdata(key, off, len, oldstr, fcn) {
        if (len == 0) {
            iOS.getmediadone(key);
            fcn(oldstr);
            return;
        }
        var newlen = (len < 100000) ? len : 100000;
        iOS.getmediadata(key, off, newlen, function (str) {
            iOS.processdata(key, off + newlen, len - newlen, oldstr + str, fcn);
        });
    }

    static getsettings(fcn) {
        var result = tabletInterface.io_getsettings();
        if (fcn) {
            fcn(result);
        }
    }

    static getmediadone(file, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_getmediadone(file, fcn);
        } else {
            var result = tabletInterface.io_getmediadone(file);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static setmedia(str, ext, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_setmedia(str, ext, fcn);
        } else {
            var result = tabletInterface.io_setmedia(str, ext);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static setmedianame(str, name, ext, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_setmedianame(str, name, ext, fcn);
        } else {
            var result = tabletInterface.io_setmedianame(str, name, ext);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static getmd5(str, fcn) {
        var result = tabletInterface.io_getmd5(str);
        if (fcn) {
            fcn(result);
        }
    }

    static remove(str, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_remove(str, fcn);
        } else {
            var result = tabletInterface.io_remove(str);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static getfile(str, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_getfile(str, fcn);
        } else {
            var result = tabletInterface.io_getfile(str);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static setfile(name, str, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_setfile(name, btoa(str), fcn);
        } else {
            var result = tabletInterface.io_setfile(name, btoa(str));
            if (fcn) {
                fcn(result);
            }
        }
    }

    // Sound functions
    static registerSound(dir, name, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.io_registersound(dir, name, fcn);
        } else {
            var result = tabletInterface.io_registersound(dir, name);
            if (fcn) {
                fcn(result);
            }
        }
    }

    static playSound(name, fcn) {
        var result = tabletInterface.io_playsound(name);
        if (fcn) {
            fcn(result);
        }
    }

    static stopSound(name, fcn) {
        var result = tabletInterface.io_stopsound(name);
        if (fcn) {
            fcn(result);
        }
    }

    // Web Wiew delegate call backs
    static soundDone(name) { //IO.m 306  + (void)soundEnded:(NSTimer*)timer 
        ScratchAudio.soundDone(name);
    }

    static sndrecord(fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_recordstart(fcn);
        } else {
            var result = tabletInterface.recordsound_recordstart();
            if (fcn) {
                fcn(result);
            }
        }
    }

    static recordstop(fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_recordstop(fcn);
        } else {
            var result = tabletInterface.recordsound_recordstop();
            if (fcn) {
                fcn(result);
            }
        }
    }

    static volume(fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_volume(fcn);
        } else {
            var result = tabletInterface.recordsound_volume();
            if (fcn) {
                fcn(result);
            }
        }
    }

    static startplay(fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_startplay(fcn);
        } else {
            var result = tabletInterface.recordsound_startplay();
            if (fcn) {
                fcn(result);
            }
        }
    }

    static stopplay(fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_stopplay(fcn);
        } else {
            var result = tabletInterface.recordsound_stopplay();
            if (fcn) {
                fcn(result);
            }
        }
    }

    static recorddisappear(b, fcn) {
        if (WebUtils.isWeb()) {
            tabletInterface.recordsound_recordclose(b,fcn);
        } else {
            var result = tabletInterface.recordsound_recordclose(b);
            if (fcn) {
                fcn(result);
            }
        }
    }

    // Record state
    static askpermission() {
        if (isiOS) {
            tabletInterface.askForPermission();
        }
    }

    // camera functions
    static hascamera() {
        camera = tabletInterface.scratchjr_cameracheck();
    }

    static startfeed(data, fcn) {
        var str = JSON.stringify(data);
        var result = tabletInterface.scratchjr_startfeed(str);
        if (fcn) {
            fcn(result);
        }
    }

    static stopfeed(fcn) {
        var result = tabletInterface.scratchjr_stopfeed();
        if (fcn) {
            fcn(result);
        }
    }

    static choosecamera(mode, fcn) {
        var result = tabletInterface.scratchjr_choosecamera(mode);
        if (fcn) {
            fcn(result);
        }
    }

    static captureimage(fcn) {
        tabletInterface.scratchjr_captureimage(fcn);
    }

    static hidesplash(fcn) {
        if (isiOS) {
            tabletInterface.hideSplash();
        }
        if (fcn) {
            fcn();
        }
    }

    static trace(str) {
        WebUtils.log(str); // eslint-disable-line no-console
    }

    static parse(str) {
        WebUtils.log(JSON.parse(str)); // eslint-disable-line no-console
    }

    static tracemedia(str) {
        WebUtils.log(atob(str)); // eslint-disable-line no-console
    }

    ignore() {}

    ///////////////
    // Sharing
    ///////////////
    // Called on the JS side to trigger native UI for project sharing.
    // fileName: name for the file to share
    // emailSubject: subject text to use for an email
    // emailBody: body HTML to use for an email
    // shareType: 0 for Email; 1 for Airdrop
    // b64data: base-64 encoded .SJR file to share

    static sendSjrToShareDialog(fileName, emailSubject, emailBody, shareType, b64data) {
        tabletInterface.sendSjrUsingShareDialog(fileName, emailSubject, emailBody, shareType, b64data);
    }

    // Called on the Objective-C side.  The argument is a base64-encoded .SJR file,
    // to be unzipped, processed, and stored.
    static loadProjectFromSjr(b64data) {
        try {
            IO.loadProjectFromSjr(b64data);
        } catch (err) {
            var errorMessage = 'Couldn\'t load share -- project data corrupted. ' + err.message;
            Alert.open(gn('frame'), gn('frame'), errorMessage, '#ff0000');
            WebUtils.log(err); // eslint-disable-line no-console
            return 0;
        }
        return 1;
    }

    // Name of the device/iPad to display on the sharing dialog page
    // fcn is called with the device name as an arg
    static deviceName(fcn) {
        fcn(tabletInterface.deviceName());
    }

    static analyticsEvent(category, action, label) {
        tabletInterface.analyticsEvent(category, action, label);
    }

    static setAnalyticsPlacePref(preferredPlace) {
        tabletInterface.setAnalyticsPlacePref(preferredPlace);
    }

    // Web Wiew delegate call backs
    static pageError(desc) { //ViewController.m 168 - (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
        console.log('XCODE ERROR:', desc); // eslint-disable-line no-console
        if (window.location.href.indexOf('home.html') > -1) {
            if (Lobby.errorTimer) {
                Lobby.errorLoading(desc);
            }
        }
    }
}

// Expose iOS methods for ScratchJr tablet sharing callbacks
window.iOS = iOS;
