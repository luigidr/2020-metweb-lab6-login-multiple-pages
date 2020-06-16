'use strict';

function createTasksPage() {
  return `<!-- Left sidebar -->
  <aside class="collapse d-sm-block col-sm-4 col-12 bg-light below-nav" id="left-sidebar">
    <div class="list-group list-group-flush">
      <a href="/" class="list-group-item list-group-item-action active">Tutti</a>
      <a href="/tasks/important" class="list-group-item list-group-item-action">Importanti</a>
      <a href="/tasks/today" class="list-group-item list-group-item-action">Oggi</a>
      <a href="/tasks/week" class="list-group-item list-group-item-action">Prossimi 7 giorni</a>
      <a href="/tasks/private" class="list-group-item list-group-item-action">Privati</a>
      <a href="/tasks/shared" class="list-group-item list-group-item-action">Condivisi con...</a>
    </div>

    <div class="my-5">
      <h6 class="border-bottom border-gray p-3 mb-0">Progetti</h6>
      <div class="list-group list-group-flush" id="projects">
      </div>
    </div>
  </aside>

  <!-- Main content -->
  <main class="col-sm-8 col-12 below-nav">
    <h1 id="filter-title">Tutti</h1>

    <div id="error-messages"></div>

    <!-- List of tasks -->
    <ul class="list-group list-group-flush" id="task-list">
    </ul>

    <!-- Add a new task... -->
    <a type="button" href="/add" id="add-button" class="btn btn-lg btn-success fixed-right-bottom">&#43;</a>

  </main>`;
}

export default createTasksPage;