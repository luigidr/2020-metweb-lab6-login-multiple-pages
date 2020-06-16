'use strict';

function createAddForm() {
    return`<main class="col-8 mx-auto below-nav">
    <form role="form" method="POST" action="" id="add-form">
      <div id="error-messages"></div>
      <input type="text" name="id" id="form-id" hidden>          
      <div class="form-group">
        <label class="control-label">Descrizione</label>
        <div>
            <input type="text" class="form-control input-lg" name="Descrizione" placeholder="Inserisci una descrizione..." id="form-description" required>
        </div>
      </div>

      <div class="form-group">
        <label class="control-label">Progetto</label>
        <div>
            <input type="text" class="form-control input-lg" name="Progetto" placeholder="Inserisci un progetto per il task..." id="form-project">
        </div>
      </div>

      <div class="form-group">
        <div>
          <label for="form-important" class="control-label">Importante</label>
          <input type="checkbox" name="form-important" id="form-important"/>          
        </div>
      </div>

      <div class="form-group">
        <div>
          <label for="form-private" class="control-label">Privato</label>
          <input type="checkbox" name="form-private" id="form-private" checked/>          
        </div>
      </div>

      <div class="form-group">
        <label class="control-label">Scadenza</label>
        <div>
            <input type="date" class="form-control input-lg" name="Deadline" id="form-deadline-date">
        </div>
      </div>
      <div class="form-group">
        <div>
          <input type="time" class="form-control input-lg" name="Deadline" id="form-deadline-time">
        </div>
      </div>

      <div class="form-group">
        <div>
            <button type="submit" class="btn btn-primary">Salva</button>
        </div>
      </div>
    </form>
  </main>`;
}

export default createAddForm;