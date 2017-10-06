/* 
1. There are several things that can be improved in "ex2.js", including:

	- are there anonymous function expressions which could be improved with a lexical name?
	- are there usages of `var` which are more appropriate to be declared with `let` or `const`? Do any literal values need to be made into `const`ant declarations?
	- should certain variable declarations be contained in explicit blocks of scope?

2. **BONUS:** How would you describe to a coworker or boss the improvements in readability after applying your knowledge of scoped declarations to this code? Write out a few sentences.
*/

(function() {
  const projectTemplate =
    "<div class='project-entry'><h3 class='project-description' rel='js-project-description'></h3><ul class='work-entries' rel='js-work-entries'></ul><span class='work-time' rel='js-work-time'></span></div>";
  const workEntryTemplate =
		"<li class='work-entry'><span class='work-time' rel='js-work-time'></span><span class='work-description' rel='js-work-description'></span></li>";
		
	const MIN_MINUTES = 0;
	const MAX_MINUTES = 600;
	const MAX_DESC_LEN = 5;
	

  let projects = [];

  let $workEntryForm;
  let $workEntrySelectProject;
  let $workEntryDescription;
  let $workEntryTime;
  let $workEntrySubmit;
  let $totalTime;
  let $projectList;

  // **************************

  function initUI() {
    $workEntryForm = $("[rel*=js-work-entry-form");
    $workEntrySelectProject = $workEntryForm.find("[rel*=js-select-project]");
    $workEntryDescription = $workEntryForm.find("[rel*=js-work-description]");
    $workEntryTime = $workEntryForm.find("[rel*=js-work-time]");
    $workEntrySubmit = $workEntryForm.find("[rel*=js-submit-work-entry]");
    $totalTime = $("[rel*=js-total-work-time]");
    $projectList = $("[rel*=js-project-list]");

    function handleClick() {
      let projectId = $workEntrySelectProject.val();
      let description = $workEntryDescription.val();
      let minutes = $workEntryTime.val();

      if (!validateWorkEntry(description, minutes)) {
        alert("Oops, bad entry. Try again.");
        $workEntryDescription[0].focus();
        return;
      }

      $workEntryDescription.val("");
      $workEntryTime.val("");
      addWorkToProject(Number(projectId), description, Number(minutes));
      $workEntryDescription[0].focus();
    }

    $workEntrySubmit.on("click", handleClick);
  }

  function validateWorkEntry(description, minutes) {
    if (description.length < MAX_DESC_LEN) return false;
    if (
      /^\s*$/.test(minutes) ||
      Number.isNaN(Number(minutes)) ||
      minutes < MIN_MINUTES ||
      minutes > MAX_MINUTES
    ) {
      return false;
    }

    return true;
  }

  function addProject(description) {
    const ONEE4 = 1e4;
    let projectId = Math.round(Math.random() * ONEE4);
    let projectEntryData = {
      id: projectId,
      description: description,
      work: [],
      time: 0
    };
    projects.push(projectEntryData);

    addProjectToList(projectEntryData);
    addProjectSelection(projectEntryData);
  }

  function addProjectToList(projectEntryData) {
    let $project = $(projectTemplate);
    $project.attr("data-project-id", projectEntryData.id);
    $project
      .find("[rel*=js-project-description]")
      .text(projectEntryData.description);
    $projectList.append($project);

    projectEntryData.$element = $project;
  }

  function addProjectSelection(projectEntryData) {
    let $option = $("<option></option>");
    $option.attr("value", projectEntryData.id);
    $option.text(projectEntryData.description);
    $workEntrySelectProject.append($option);
  }

  function findProjectEntry(projectId) {
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].id === projectId) {
        return projects[i];
      }
    }
  }

  function addWorkToProject(projectId, description, minutes) {
    projects.time = (projects.time || 0) + minutes;

    var projectEntryData = findProjectEntry(projectId);
    projectEntryData.time = (projectEntryData.time || 0) + minutes;

    // create a new work entry for the list
    var workEntryData = {
      id: projectEntryData.work.length + 1,
      description: description,
      time: minutes
    };
    projectEntryData.work.push(workEntryData);

    // multiple work entries now?
    if (projectEntryData.work.length > 1) {
      // sort work entries in descending order of time spent
      projectEntryData.work = projectEntryData.work
        .slice()
        .sort(function(a, b) {
          return b.time - a.time;
        });
    }

    addWorkEntryToList(projectEntryData, workEntryData);
    updateProjectTotalTime(projectEntryData);
    updateWorkLogTotalTime();
  }

  function addWorkEntryToList(projectEntryData, workEntryData) {
    var $projectEntry = projectEntryData.$element;
    var $projectWorkEntries = $projectEntry.find("[rel*=js-work-entries]");

    // create a new DOM element for the work entry
    var $workEntry = $(workEntryTemplate);
    $workEntry.attr("data-work-entry-id", workEntryData.id);
    $workEntry.find("[rel*=js-work-time]").text(formatTime(workEntryData.time));
    $workEntry
      .find("[rel*=js-work-description]")
      .text(formatWorkDescription(workEntryData.description));

    workEntryData.$element = $workEntry;

    // multiple work entries now?
    if (projectEntryData.work.length > 1) {
			// find where the entry sits in the new sorted list
			let entryIdx = 0;
      for (
        let i = 0;
        i < projectEntryData.work.length;
        i++
      ) {
				entryIdx += i;
        if (projectEntryData.work[i] === workEntryData) {
          break;
        }
      }

      // insert the entry into the correct location in DOM
      if (entryIdx < projectEntryData.work.length - 1) {
        projectEntryData.work[entryIdx + 1].$element.before($workEntry);
      } else {
        projectEntryData.work[entryIdx - 1].$element.after($workEntry);
      }
    } else {
      // otherwise, just the first entry
      $projectEntry.addClass("visible");
      $projectWorkEntries.append($workEntry);
    }
  }

  function updateProjectTotalTime(projectEntryData) {
    var $projectEntry = projectEntryData.$element;
    $projectEntry
      .find("> [rel*=js-work-time]")
      .text(formatTime(projectEntryData.time))
      .show();
  }

  function updateWorkLogTotalTime() {
    if (projects.time > 0) {
      $totalTime.text(formatTime(projects.time)).show();
    } else {
      $totalTime.text("").hide();
    }
  }

  function formatWorkDescription(description) {
    if (description.length > 20) {
      description = `${description.substr(0, 20)}...`;
    }
    return description;
  }

  function formatTime(time) {
    var hours = Math.floor(time / 60);
    var minutes = time % 60;
    if (hours == 0 && minutes == 0) return "";
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hours}:${minutes}`;
  }

  // **************************
  initUI();

  // hard coding some initial data
  addProject("client features");
  addProject("overhead");
  addProject("backlog");
})();
