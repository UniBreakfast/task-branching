main();

async function main() {
  const taskOptions = await getTaskOptions();
  const taskNames = getTaskNames(taskOptions);
  
  console.log(taskOptions);
  console.log(taskNames);
}

function getTaskOptions() {
  return fetch('/task-options.json')
    .then(response => response.json());
}

function getTaskNames(taskOptions) {
  const taskNames = taskOptions.tasks.map(task => task.name);
  return taskNames;
}
