function addProjectWidget(id, projectName, projectVersion, projectIcon, projectDir) {
    console.log("addProjectWidget");
    
    var widgetId = "projectWidget_" + id.toString();
    var projectStatusId = "project-status_" + id.toString();
    var projectDetailsId = "project-details_" + id.toString();
    var projectDirId = "project-dir_" + id.toString();
    var deleteId = "delete_" + id.toString();
    var projectIconId = "projectIconId_" + id.toString();
    var projectNameLabel = "projectNameLabel_" + id.toString();
    var projectVersionLabel = "projectVersionLabel_" + id.toString();
    
    var widgetDOM = "";  
    
    // open the widget
    widgetDOM += "<div class='row widget-border' id='" + widgetId + "'>";

    // project icon
    widgetDOM += "<div class='column'>";
    
	widgetDOM += "<div class='flip-container'>";
	widgetDOM += "<div class='flipper'>";
	
	widgetDOM += "<div class='front'>";
    widgetDOM += "<img id='" + projectIconId + "' height='64' width='64' src='" + projectIcon + "' />";
    widgetDOM += "</div>";  // front content
    
    widgetDOM += "<div class='back delete-holder' id=" + deleteId + ">";
    widgetDOM += "<img src='img/icons/normal/delete.svg' class='delete-button' />";
    widgetDOM += "</div>";  // back content
	
	widgetDOM += "</div>";  // flipper
	widgetDOM += "</div>";  // flip-container
       
    widgetDOM += "</div>";
    
    // project info
    widgetDOM += "<div class='column project-details-column' id='" + projectDetailsId + "'>";
    widgetDOM += "<div id='" + projectNameLabel + "' class='project-name'>" + projectName + "</div>";
    widgetDOM += "<div id='" + projectVersionLabel + "' class='project-version'>v" + projectVersion + "</div>";
    widgetDOM += "</div>";
    
    // indicator active project
    widgetDOM += "<div class='column project-indicator'>";
    widgetDOM += "<img id='start-icon_" + id.toString() + "' class='start-icon' src='img/icons/normal/start.svg' />";
    widgetDOM += "<img id='hr-icon_" + id.toString() + "' class='hr-icon' src='img/icons/normal/hr.svg' />";
    widgetDOM += "<img id='stop-icon_" + id.toString() + "' class='stop-icon' src='img/icons/normal/stop.svg' />";   
    widgetDOM += "</div>";
    
    // project folder
    widgetDOM += "<div class='row'>";
    widgetDOM += "<div class='column'>";
    widgetDOM += "<div class='localPath'>Local path:</div>"
    widgetDOM += "<div class='projDir'><a href='#' id='" + projectDirId + "' class='projectDirLink'>" + projectDir + "</a></div>";
    widgetDOM += "</div>";
    widgetDOM += "</div>";
    
    widgetDOM += "</div>";  // close the widget
    
    global.jQuery("#drop_zone").append(widgetDOM);
    enableMinusButton();
    global.jQuery("#guide-add").hide();
        
    global.jQuery("#" + deleteId).on("click", function(event) {
        console.log(deleteId);
        
        var temp = global.jQuery("#" + deleteId).attr("id").split("_");
        var clickedId = temp[1];
        
        removeProjectWidget(clickedId);
    })
    
    global.jQuery("#" + projectDirId).on("click", function() {
        opener(projectDir);     
    });
    
    global.jQuery("#start-icon_" + id.toString()).on("mouseover", function() {
        imgSwapper("start-icon_" + id.toString(), "img/icons/hover/start-hover.svg");
    });
    
    global.jQuery("#start-icon_" + id.toString()).on("mouseout", function() {
        if (id == global.activeWidget.projectId) {
            imgSwapper("start-icon_" + id.toString(), "img/icons/active/start-active.svg");
        } else {
            imgSwapper("start-icon_" + id.toString(), "img/icons/normal/start.svg");
        }        
    });    

    global.jQuery("#stop-icon_" + id.toString()).on("mouseover", function() {
        imgSwapper("stop-icon_" + id.toString(), "img/icons/hover/stop-hover.svg");
    });
    
    global.jQuery("#stop-icon_" + id.toString()).on("mouseout", function() {
        imgSwapper("stop-icon_" + id.toString(), "img/icons/normal/stop.svg");
    });
        
    global.jQuery("#" + widgetId).on("click", function() {
        var temp = global.jQuery("#" + widgetId).attr("id").split("_");
        var id = temp[1];
        
        // only allow setting of active widget if another project widget is selected
        if (id != global.activeWidget.projectId) {   
            setActiveWidget(id, projectDir);  
        }             
    });
}

function setActiveWidget(id, projDir) {
    console.log("setActiveWidget"); 
   
    var previousActiveWidget = global.activeWidget;
        
    var activeWidget = {};
    activeWidget.widgetId = "projectWidget_" + id.toString();
    activeWidget.projectId = id;
    global.activeWidget = activeWidget;
    localStorage.projDir = projDir;
    
    console.log("activeId: " + id);
       
    // update GUI to display details of the active widget          
    global.jQuery("#" + activeWidget.widgetId).css("background-color", "#f0f0f0");                                                                                  
    global.jQuery("#start-icon_" + activeWidget.projectId.toString()).attr("src", "img/icons/active/start-active.svg");
    global.jQuery("#hr-icon_" + activeWidget.projectId.toString()).css("opacity", 1.0);
    global.jQuery("#stop-icon_" + activeWidget.projectId.toString()).css("opacity", 1.0);
    global.jQuery("#stop-icon_" + activeWidget.projectId.toString()).addClass("stop-icon-active");

    // set a watch on the config.xml of the active project
    setConfigWatcher(id, projDir);
    
    // turn on the server
    toggleServerStatus();
           
    // reset the previous active widget
    if (previousActiveWidget) {
        console.log("prevId: " + previousActiveWidget.projectId);
        global.jQuery("#" + previousActiveWidget.widgetId).css("background-color", "#e8e9e9"); 
        global.jQuery("#start-icon_" + previousActiveWidget.projectId.toString()).attr("src", "img/icons/normal/start.svg");      
        global.jQuery("#hr-icon_" + previousActiveWidget.projectId.toString()).css("opacity", 0.0);
        global.jQuery("#stop-icon_" + previousActiveWidget.projectId.toString()).css("opacity", 0.0);
        global.jQuery("#stop-icon_" + previousActiveWidget.projectId.toString()).removeClass("stop-icon-active");
    }
}

function setConfigWatcher(id, projDir) {
    console.log("config watcher");
    
    var configFile = projDir + "/www/config.xml";
    
    process.chdir(projDir + "/www");
   
    gaze("config.xml", function (err, watcher) {
        
        console.log(this.watched());
        
        this.on("error", function(e) {
            console.log(e.message);
        });
        
        this.on("changed", function(filepath) {          
            // reload the updated values from config.xml & update the GUI
            fs.readFile(configFile, 'utf8', function(err, data) {
                if (err) throw err;

                var iconPath = projDir + "/www/";
                var projectDetailsId = "project-details_" + id.toString();
                var projectIconId = "projectIconId_" + id.toString();
                var projectNameLabel = "projectNameLabel_" + id.toString();
                var projectVersionLabel = "projectVersionLabel_" + id.toString();
                
                global.jQuery.xmlDoc = global.jQuery.parseXML(data);
                global.jQuery.xml = global.jQuery(global.jQuery.xmlDoc);

                // get the project name
                var projectName = global.jQuery.xml.find("name").text();

                // get the project version
                var projectVersion = global.jQuery.xml.find("widget").attr("version");

                // get the app icon
                var projectIcon = global.jQuery.xml.find("icon").attr("src");
                iconPath += projectIcon;
                
                global.jQuery("#" + projectNameLabel).text(projectName);
                global.jQuery("#" + projectVersionLabel).text("v" + projectVersion);
                global.jQuery("#" + projectIconId).attr("src", iconPath);
            });
        });
    });
}

function removeProjectWidget(idToDelete) {
    console.log("removeProjectWidget - id: " + idToDelete);
    var widgetId = "projectWidget_" + idToDelete.toString();
    displayRemoveNotification();    
    global.jQuery("#" + widgetId).addClass("animated slideOutLeft");
    global.jQuery("#" + widgetId).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd onanimationend animationend", deleteProjectWidget(idToDelete));
}

function deleteProjectWidget(idToDelete) {
    console.log("deleteProjectWidget")
    var widgetId = "projectWidget_" + idToDelete.toString();
    global.jQuery("#" + widgetId).removeClass("animated slideOutLeft");
    global.jQuery("#" + widgetId).hide();
    global.jQuery("#" + widgetId).remove();
    removeProjectById(idToDelete);    
}

function displayRemoveNotification() {
    console.log("displayRemoveNotification");
    global.jQuery("#remove-notification").addClass("animated slideInUp");
    global.jQuery("#remove-notification").show();       
    global.jQuery("#remove-notification").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd onanimationend animationend", hideRemoveNotification);
}

function hideRemoveNotification() {
    console.log("hideRemoveNotification");
    global.jQuery("#remove-notification").removeClass("animated slideInUp"); 
    global.jQuery("#remove-notification").addClass("animatedFade fadeOut");    
    global.jQuery("#remove-notification").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd onanimationend animationend", resetRemoveNotification);
}

function resetRemoveNotification() {
    console.log("resetRemoveNotification");
    global.jQuery("#remove-notification").removeClass("animatedFade fadeOut"); 
    global.jQuery("#remove-notification").hide();
}