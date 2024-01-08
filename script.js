let taskOptions, task, form, fieldSet, backBtn, nextBtn, finishBtn;
const result = { task: {}, requirements: {} };

main();

async function main() {
  taskOptions = await getTaskOptions();
  const taskNames = getTaskNames(taskOptions);

  showForm(taskNames);
}

function getTaskOptions() {
  return fetch('/task-options.json')
    .then(response => response.json());
}

function getTaskNames(taskOptions) {
  const taskNames = taskOptions.tasks.map(task => task.name);
  return taskNames;
}

function showForm(taskNames) {
  prepareForm();
  showFirstQuestion(taskNames);
}

function prepareForm() {
  form = document.createElement('form');
  backBtn = document.createElement('button');
  nextBtn = document.createElement('button');
  finishBtn = document.createElement('button');

  document.body.appendChild(form)
    .append(backBtn, nextBtn, finishBtn);
  backBtn.append('Back');
  nextBtn.append('Next');
  finishBtn.append('Finish');
}

function showFirstQuestion(taskNames) {
  backBtn.hidden = true;

  fieldSet = fieldSet || document.createElement('fieldset');
  const taskOptions = taskNames.map(makeTaskOption);

  form.append(fieldSet);
  fieldSet.replaceChildren(...taskOptions);

  if (result.task?.name) {
    form.querySelector(`input[value="${result.task.name}"]`).checked = true;
  }

  form.addEventListener('submit', handleFirstAnswer);
}

function makeTaskOption(taskName) {
  const p = document.createElement('p');
  const label = document.createElement('label');
  const input = document.createElement('input');

  input.type = 'radio';
  input.name = 'task';
  input.value = taskName;

  p.appendChild(label).append(input, taskName);

  return p;
}

function handleFirstAnswer(event) {
  event.preventDefault();

  const taskName = new FormData(form).get('task');

  if (!taskName) {
    alert('Please select a task.');
    return;
  }

  task = taskOptions.tasks
    .find(task => task.name === taskName);

  const { name, description, subtasks } = task;

  if (result.task.name !== name) {
    result.task = { name, description, subtasks: [] };
  }

  form.removeEventListener('submit', handleFirstAnswer);

  if (event.submitter === nextBtn) {
    showSecondQuestion(subtasks);
  } else {
    showResult();
  }
}

function showSecondQuestion(subtasks) {
  const subtaskOptions = subtasks.map(makeSubtaskOption);

  backBtn.hidden = false;
  fieldSet.replaceChildren(...subtaskOptions);

  form.addEventListener('submit', handleSecondAnswer);

  if (result.task.subtasks.length) {
    result.task.subtasks.forEach(subtask => {
      form.querySelector(`input[value="${subtask}"]`).checked = true;
    });
  }
}

function makeSubtaskOption(subtask) {
  const p = document.createElement('p');
  const label = document.createElement('label');
  const input = document.createElement('input');

  input.type = 'checkbox';
  input.name = 'subtask';
  input.value = subtask;

  p.appendChild(label).append(input, subtask);

  return p;
}

function handleSecondAnswer(event) {
  event.preventDefault();

  result.task.subtasks = new FormData(form).getAll('subtask');

  form.removeEventListener('submit', handleSecondAnswer);

  if (event.submitter === backBtn) {
    showFirstQuestion(getTaskNames(taskOptions));
  } else if (event.submitter === nextBtn) {
    showNextQuestion(Object.keys(taskOptions.requirements)[0]);
  } else {
    showResult();
  }
}

function showNextQuestion(requirementName) {
  const requirementOptions = taskOptions.requirements[requirementName]
    .map(makeRequirementOption(requirementName));
  const i = Object.keys(taskOptions.requirements).indexOf(requirementName);
  const nextRequirementName = Object.keys(taskOptions.requirements)[i + 1];

  nextBtn.hidden = !nextRequirementName;

  fieldSet.replaceChildren(...requirementOptions);

  form.addEventListener('submit', handleNextAnswer);

  if (result.requirements[requirementName]) {
    form.querySelector(`input[value="${result.requirements[requirementName]}"]`).checked = true;
  }
}

function makeRequirementOption(requirementName) {
  return requirement => {
    const p = document.createElement('p');
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = requirementName;
    input.value = requirement;

    p.appendChild(label).append(input, requirement);

    return p;
  };
}

function handleNextAnswer(event) {
  event.preventDefault();

  const requirementName = form[form.length - 1].name;
  const requirement = new FormData(form).get(requirementName);
  const i = Object.keys(taskOptions.requirements).indexOf(requirementName);

  if (event.submitter === backBtn) {
    const prevRequirementName = Object.keys(taskOptions.requirements)[i - 1];

    if (prevRequirementName) {
      showNextQuestion(prevRequirementName);
    } else {
      showSecondQuestion(task.subtasks);
    }
  } else {
    result.requirements[requirementName] = requirement;

    if (event.submitter === nextBtn) {
      const nextRequirementName = Object.keys(taskOptions.requirements)[i + 1];

      if (nextRequirementName) {
        showNextQuestion(nextRequirementName);
      } else {
        showResult();
      }
    } else {
      showResult();
    }
  }
}

function showResult() {
  const h2 = document.createElement('h2');
  const p = document.createElement('p');
  const ul = document.createElement('ul');
  const items = result.task.subtasks.map(makeListItem);
  const dl = document.createElement('dl');
  const dItems = Object.entries(result.requirements)
    .flatMap(makeDefinitionItems);

  h2.append(result.task.name);
  p.append(result.task.description);
  ul.append(...items);
  dl.append(...dItems);
  form.replaceWith(h2, p, ul, dl);
}

function makeListItem(subtask) {
  const li = document.createElement('li');
  const label = document.createElement('label');
  const input = document.createElement('input');

  input.type = 'checkbox';
  li.appendChild(label).append(input, subtask);

  return li;
}

function makeDefinitionItems([requirementName, requirement]) {
  if (!requirement) return [];

  const dt = document.createElement('dt');
  const dd = document.createElement('dd');

  dt.append(requirementName + ':');
  dd.append(requirement);

  return [dt, dd];
}
