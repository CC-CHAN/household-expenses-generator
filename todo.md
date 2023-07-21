= config
= model
= csv mangement

(weight * 100).toFixed(2),
<div>
  <table class="table table-sm table-striped">
    <thead>
      <!-- <% for (const h of headers) { %>
      <tr>
        <th scope="col"><%= h %></th>
      </tr>
      <% } %> -->
      <tr>
        <th scope="col">#</th>
        <th scope="col">First</th>
        <th scope="col">Last</th>
        <th scope="col">Handle</th>
      </tr>
    </thead>
    <tbody>
      <!-- <% for (const i = 0; i < records.length, i++) { %>
      <tr>
        <td><%= r.date %></td>
        <td><%= r.score %></td>
        <td><%= r.total %></td>
        <td><%= r.isPaid %></td>
      </tr>
      <% } %> -->
      <tr>
        <th scope="row">1</th>
        <td>Mark</td>
        <td>Otto</td>
        <td>@mdo</td>
      </tr>
      <tr>
        <th scope="row">2</th>
        <td>Jacob</td>
        <td>Thornton</td>
        <td>@fat</td>
      </tr>
      <tr>
        <th scope="row">3</th>
        <td>Larry</td>
        <td>the Bird</td>
        <td>@twitter</td>
      </tr>
    </tbody>
  </table>
</div>


<div>
  <table class="table table-sm table-striped">
    <thead>
      <tr>
        <!-- <% for (const h of header) { %>
          <tr>
            <th scope="col"><%= h %></th>
          </tr>
          <% } %> -->
        <th scope="col">#</th>
        <th scope="col">First</th>
        <th scope="col">Last</th>
        <th scope="col">Handle</th>
      </tr>
    </thead>
    <tbody>
      <!-- <% for (const r of records) { %>
      <tr>
        <td><%= r.date %></td>
        <td><%= quotation[i].quantity %></td>
        <td><%= quotation[i].factory %></td>
      </tr>
      <% } %> -->
      <tr>
        <th scope="row">1</th>
        <td>Mark</td>
        <td>Otto</td>
        <td>@mdo</td>
      </tr>
      <tr>
        <th scope="row">2</th>
        <td>Jacob</td>
        <td>Thornton</td>
        <td>@fat</td>
      </tr>
      <tr>
        <th scope="row">3</th>
        <td>Larry</td>
        <td>the Bird</td>
        <td>@twitter</td>
      </tr>
    </tbody>
  </table>
</div>
<div><%= records %></div>