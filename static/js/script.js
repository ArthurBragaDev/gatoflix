      const searchInput = document.getElementById("searchInput");
      const searchBtn = document.getElementById("searchBtn");
      const results = document.getElementById("results");
      const loading = document.getElementById("loading");
      const error = document.getElementById("error");
      const noResults = document.getElementById("noResults");
      const statusContainer = document.querySelector(".status-container");
      const resultsHeader = document.getElementById("resultsHeader");
      const resultCount = document.getElementById("resultCount");

      // Event listeners
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !searchBtn.disabled) search();
      });

      searchBtn.addEventListener("click", search);

      async function search() {
        const query = searchInput.value.trim();

        if (!query) {
          showNoResults("🍿 Prepare a pipoca e faça sua busca");
          return;
        }

        showLoading();
        searchBtn.disabled = true;

        try {
          // Nota: Mantive a mesma rota de API, assumindo que seu backend
          // continua funcionando igual.
          const response = await fetch("/api/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          });

          const data = await response.json();

          if (!response.ok) {
            showError(data.error || "Erro ao buscar resultados");
            return;
          }

          if (data.results.length === 0) {
            showNoResults(`💀 Nada encontrado para "${query}"`);
            return;
          }

          displayResults(data.results);
        } catch (err) {
          showError("Erro de conexão. Verifique sua internet.");
          console.error(err);
        } finally {
          searchBtn.disabled = false;
        }
      }

      function displayResults(movies) {
        results.innerHTML = "";
        statusContainer.style.display = "none";
        resultsHeader.style.display = "flex";
        resultCount.textContent = movies.length;

        movies.forEach((movie) => {
          const card = document.createElement("div");
          card.className = "movie-card";

          const typeClass = movie.media_type === "tv" ? "tv" : "movie";
          const typeText = movie.media_type === "tv" ? "Série" : "Filme";

          card.innerHTML = `
                    <div class="movie-poster">
                        ${
                          movie.cover_url
                            ? `<img src="${movie.cover_url}" alt="${movie.title}" loading="lazy">`
                            : `<span style="color:var(--primary); font-size: 3rem;">🎬</span>`
                        }
                    </div>
                    <div class="movie-info">
                        <div class="movie-title">${movie.title}</div>
                        <span class="movie-type ${typeClass}">${typeText}</span>
                    </div>
                `;

          results.appendChild(card);
        });
      }

      function showLoading() {
        results.innerHTML = "";
        resultsHeader.style.display = "none";
        statusContainer.style.display = "block";
        loading.classList.add("active");
        error.classList.remove("active");
        noResults.classList.remove("active");
      }

      function showError(message) {
        results.innerHTML = "";
        resultsHeader.style.display = "none";
        statusContainer.style.display = "block";
        error.textContent = message;
        error.classList.add("active");
        loading.classList.remove("active");
        noResults.classList.remove("active");
      }

      function showNoResults(message) {
        results.innerHTML = "";
        resultsHeader.style.display = "none";
        statusContainer.style.display = "block";
        noResults.textContent = message;
        noResults.classList.add("active");
        error.classList.remove("active");
        loading.classList.remove("active");
      }

      // Initial state
      showNoResults("🍿 Prepare a pipoca e faça sua busca");
