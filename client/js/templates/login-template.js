'use strict';

function createLoginForm() {
    return`<form method="POST" action="" id="login-form" class="col-6 mx-auto below-nav">
    <div id="error-messages"></div>
    <div class="form-group">
      <label for="email">Indirizzo mail</label>
      <input type="email" name="email" class="form-control" required />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" name="password" class="form-control" required autocomplete/>
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
  </form>`;
}

export default createLoginForm;