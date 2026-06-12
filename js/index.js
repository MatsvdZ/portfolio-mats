const cursorDot = document.querySelector(".cursor-dot");

if (cursorDot) {
  window.addEventListener("mousemove", (event) => {
    cursorDot.animate(
      {
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
      },
      {
        duration: 450,
        fill: "forwards",
        easing: "ease-out",
      },
    );
  });
}

const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateX = (y / rect.height - 0.5) * -3;
    const rotateY = (x / rect.width - 0.5) * 3;

    card.style.setProperty("--tilt-x", `${rotateX}deg`);
    card.style.setProperty("--tilt-y", `${rotateY}deg`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
});

const canvas = document.getElementById("portraitCanvas");
const image = document.getElementById("portraitImage");

if (canvas && image) {
  const ctx = canvas.getContext("2d");

  let particles = [];
  let animationStarted = false;

  const mouse = {
    x: undefined,
    y: undefined,
    radius: 90,
  };

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticles() {
    particles = [];

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.drawImage(image, 0, 0, width, height);

    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const gap = 5;

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const index = (y * width + x) * 4;

        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const alpha = data[index + 3];

        const brightness = (red + green + blue) / 3;

        if (alpha > 80 && brightness > 35) {
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            size: (brightness / 255) * 2.6 + 0.8,
            color: `rgb(${red}, ${green}, ${blue})`,
            density: Math.random() * 30 + 1,
          });
        }
      }
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    particles.forEach((particle) => {
      if (mouse.x !== undefined && mouse.y !== undefined) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          particle.x -= Math.cos(angle) * force * particle.density;
          particle.y -= Math.sin(angle) * force * particle.density;
        } else {
          particle.x += (particle.baseX - particle.x) * 0.08;
          particle.y += (particle.baseY - particle.y) * 0.08;
        }
      } else {
        particle.x += (particle.baseX - particle.x) * 0.08;
        particle.y += (particle.baseY - particle.y) * 0.08;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  function initPortrait() {
    resizeCanvas();
    createParticles();

    mouse.x = undefined;
    mouse.y = undefined;

    if (!animationStarted) {
      animationStarted = true;
      drawParticles();
    }
  }

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();

    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  canvas.addEventListener("mouseleave", () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  window.addEventListener("resize", () => {
    initPortrait();
  });

  if (image.complete) {
    initPortrait();
  } else {
    image.addEventListener("load", initPortrait);
  }
}

const scrollProgress = document.querySelector(".scroll-progress");

window.addEventListener("scroll", () => {
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = (window.scrollY / scrollHeight) * 100;
  scrollProgress.style.width = `${progress}%`;
});

const liveStatus = document.getElementById("liveStatus");

const statuses = [
  "currently fixing one tiny detail",
  "probably adjusting border-radius",
  "thinking about motorcycles",
  "making CSS do things it shouldn’t",
  "adding just one more interaction",
  "debugging with confidence and panic",
];

if (liveStatus) {
  liveStatus.textContent =
    statuses[Math.floor(Math.random() * statuses.length)];
}

const goal = document.querySelector(".typing");

if (goal) {
  const text = "find internship.exe";
  let i = 0;

  goal.textContent = "";

  function type() {
    if (i < text.length) {
      goal.textContent += text.charAt(i);
      i++;
      setTimeout(type, 80);
    }
  }

  type();
}

const projectStacks = document.querySelectorAll("[data-project-stack]");

projectStacks.forEach((stack) => {
  const images = [...stack.querySelectorAll(".stack-images img")];
  const prevButton = stack.querySelector(".stack-prev");
  const nextButton = stack.querySelector(".stack-next");
  const dotsContainer = stack.querySelector(".stack-dots");

  let currentIndex = 0;

  images.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to screenshot ${index + 1}`);

    dot.addEventListener("click", () => {
      currentIndex = index;
      updateStack();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = [...dotsContainer.querySelectorAll("button")];

  function updateStack() {
    images.forEach((image, index) => {
      image.classList.remove("active", "prev-shot", "next-shot");

      const previousIndex = (currentIndex - 1 + images.length) % images.length;
      const nextIndex = (currentIndex + 1) % images.length;

      if (index === currentIndex) {
        image.classList.add("active");
      }

      if (index === previousIndex) {
        image.classList.add("prev-shot");
      }

      if (index === nextIndex) {
        image.classList.add("next-shot");
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function nextShot() {
    currentIndex = (currentIndex + 1) % images.length;
    updateStack();
  }

  function prevShot() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateStack();
  }

  nextButton.addEventListener("click", nextShot);
  prevButton.addEventListener("click", prevShot);

  stack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      nextShot();
    }

    if (event.key === "ArrowLeft") {
      prevShot();
    }
  });

  stack.tabIndex = 0;
  updateStack();
});

const statusText = document.querySelector(".typing-status");

if (statusText) {
  const text = "still downloading...";
  let index = 0;

  function typeStatus() {
    if (index < text.length) {
      statusText.textContent += text.charAt(index);
      index++;

      setTimeout(typeStatus, 80);
    }
  }

  typeStatus();
}

const timeline = document.querySelector(".timeline");
const timelineItems = document.querySelectorAll(".timeline-item");

function updateTimelineProgress() {
  if (!timeline) return;

  const rect = timeline.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const start = windowHeight * 0.75;
  const end = rect.height;

  const progress = Math.min(Math.max((start - rect.top) / end, 0), 1);

  timeline.style.setProperty("--timeline-progress", `${progress * 100}%`);

  timelineItems.forEach((item) => {
    const itemRect = item.getBoundingClientRect();

    if (itemRect.top < windowHeight * 0.72) {
      item.classList.add("is-active");
    } else {
      item.classList.remove("is-active");
    }
  });
}

window.addEventListener("scroll", updateTimelineProgress);
window.addEventListener("resize", updateTimelineProgress);
updateTimelineProgress();
