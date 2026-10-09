
document.addEventListener("DOMContentLoaded", function () {
    const thoughtForm = document.getElementById("thoughtForm");
    const thought = document.getElementById("thought");
    const category = document.getElementById("category");
    const studentName = document.getElementById("studentName");
    const anonymous = document.getElementById("anonymous");
    const charCount = document.getElementById("charCount");
    const thoughtStatus = document.getElementById("thoughtStatus");

    const anonymousForm = document.getElementById("anonymousForm");
    const anonymousThought = document.getElementById("anonymousThought");
    const anonymousStatus = document.getElementById("anonymousStatus");

    const messageList = document.getElementById("messageList");
    const emptyState = document.getElementById("emptyState");
    const postCount = document.getElementById("postCount");
    const clearFilter = document.getElementById("clearFilter");

    // Store stories for this browser
    let stories = [];

    try {
        stories = JSON.parse(localStorage.getItem("unspokenStories")) || [];
        if (!Array.isArray(stories)) stories = [];
    } catch (error) {
        stories = [];
    }

    let activeFilter = "All";

    // Character counter
    if (thought && charCount) {
        thought.addEventListener("input", function () {
            charCount.textContent = thought.value.length + " / 600";
        });
    }

    // Topic cards take the user to the form
    document.querySelectorAll(".topic-card").forEach(function (card) {
        card.addEventListener("click", function () {
            const topic = card.dataset.topic;

            if (category) {
                const matchingOption = Array.from(category.options).find(
                    option => option.text.trim() === topic
                );

                if (matchingOption) {
                    category.value = matchingOption.value;
                }
            }

            document.getElementById("share").scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    // Save stories locally
    function saveStories() {
        try {
            localStorage.setItem("unspokenStories", JSON.stringify(stories));
        } catch (error) {
            console.warn("Stories could not be saved in this browser.");
        }
    }

    // Create a story card safely
    function createStoryCard(story) {
        const card = document.createElement("article");
        card.className = "message-card";
        card.dataset.category = story.category;

        const top = document.createElement("div");
        top.className = "message-top";

        const tag = document.createElement("span");
        tag.className = "category-tag";
        tag.textContent = story.category;

        const author = document.createElement("span");
        author.textContent = story.anonymous
            ? "ANONYMOUS"
            : story.name || "A STUDENT";

        top.append(tag, author);

        const message = document.createElement("p");
        message.textContent = "“" + story.message + "”";

        const bottom = document.createElement("div");
        bottom.className = "message-bottom";

        const date = document.createElement("span");
        date.textContent = "A STUDENT'S STORY";

        const relate = document.createElement("button");
        relate.type = "button";
        relate.className = "relate-btn";
        relate.innerHTML = "♡ I RELATE <b>" + (story.likes || 0) + "</b>";

        if (story.liked) {
            relate.dataset.liked = "true";
            relate.innerHTML = "♥ I RELATE <b>" + (story.likes || 0) + "</b>";
        }

        relate.addEventListener("click", function () {
            story.liked = !story.liked;
            story.likes = Math.max(
                0,
                (story.likes || 0) + (story.liked ? 1 : -1)
            );

            saveStories();
            renderStories();
        });

        bottom.append(date, relate);
        card.append(top, message, bottom);

        return card;
    }

    // Display stories and apply the selected filter
    function renderStories() {
        messageList.replaceChildren();

        const visibleStories = stories.filter(function (story) {
            return activeFilter === "All" ||
                story.category === activeFilter;
        });

        visibleStories.forEach(function (story) {
            messageList.appendChild(createStoryCard(story));
        });

        postCount.textContent =
            stories.length + (stories.length === 1
                ? " STORY SHARED"
                : " STORIES SHARED");

        emptyState.hidden = visibleStories.length > 0;
        messageList.hidden = visibleStories.length === 0;
    }

    // Main story form
    if (thoughtForm) {
        thoughtForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const message = thought.value.trim();
            const selectedCategory = category.value;

            if (!message || !selectedCategory) {
                thoughtStatus.textContent =
                    "Please write your story and choose a topic.";
                return;
            }

            const story = {
                id: Date.now(),
                name: anonymous.checked
                    ? ""
                    : studentName.value.trim(),
                anonymous: anonymous.checked,
                category: selectedCategory,
                message: message,
                likes: 0,
                liked: false
            };

            stories.unshift(story);
            activeFilter = "All";
            saveStories();
            renderStories();

            thoughtForm.reset();
            charCount.textContent = "0 / 600";
            thoughtStatus.textContent =
                "Your story has been added to the wall. 💗";

            document.getElementById("wall").scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    // Short anonymous thought form
    if (anonymousForm) {
        anonymousForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const message = anonymousThought.value.trim();

            if (!message) {
                anonymousStatus.textContent =
                    "Write a thought before submitting.";
                return;
            }

            stories.unshift({
                id: Date.now(),
                name: "",
                anonymous: true,
                category: "Things Left Unsaid",
                message: message,
                likes: 0,
                liked: false
            });

            activeFilter = "All";
            saveStories();
            renderStories();

            anonymousForm.reset();
            anonymousStatus.textContent =
                "Your anonymous thought has been added. 💌";

            document.getElementById("wall").scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    // Show all stories
    if (clearFilter) {
        clearFilter.addEventListener("click", function () {
            activeFilter = "All";
            renderStories();
        });
    }

    // Initial page display
    renderStories();
});
