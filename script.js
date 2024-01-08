let taskOptions, task, form, fieldSet, nextBtn, finishBtn;
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
  nextBtn = document.createElement('button');
  finishBtn = document.createElement('button');

  document.body.appendChild(form).append(nextBtn, finishBtn)
  nextBtn.append('Next');
  finishBtn.append('Finish');
}

function showFirstQuestion(taskNames) {
  fieldSet = document.createElement('fieldset');
  const taskOptions = taskNames.map(makeTaskOption);

  form.prepend(fieldSet);
  fieldSet.append(...taskOptions);

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

  result.task = { name, description, subtasks: [] };

  form.removeEventListener('submit', handleFirstAnswer);

  if (event.submitter === nextBtn) {
    showSecondQuestion(subtasks);
  } else {
    showResult();
  }
}

function showSecondQuestion(subtasks) {
  const subtaskOptions = subtasks.map(makeSubtaskOption);

  fieldSet.replaceChildren(...subtaskOptions);

  form.addEventListener('submit', handleSecondAnswer);
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

  if (event.submitter === nextBtn) {
    showNextQuestion(Object.keys(taskOptions.requirements)[0]);
  } else {
    showResult();
  }
}

function showNextQuestion(requirementName) {
  const requirementOptions = taskOptions.requirements[requirementName]
    .map(makeRequirementOption(requirementName));

  fieldSet.replaceChildren(...requirementOptions);

  form.addEventListener('submit', handleNextAnswer);
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

  const requirementName = form[1].name;
  const requirement = new FormData(form).get(requirementName);

  result.requirements[requirementName] = requirement;

  if (event.submitter === finishBtn) {
    showResult();
    return;
  }

  const i = Object.keys(taskOptions.requirements).indexOf(requirementName);
  const nextRequirementName = Object.keys(taskOptions.requirements)[i + 1];

  if (nextRequirementName) {
    showNextQuestion(nextRequirementName);
  } else {
    showResult();
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
  const input = document.createElement('input');

  input.type = 'checkbox';
  li.append(input, subtask);

  return li;
}

function makeDefinitionItems([requirementName, requirement]) {
  if (!requirement) return [];
  
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');

  dt.append(requirementName);
  dd.append(requirement);

  return [dt, dd];
}
