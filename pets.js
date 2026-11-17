// Task Starter: pixel companions
// The pictures of the companions, and the code that draws them.
//
// HOW A PICTURE IS STORED
// Each picture is a list of text rows. Every character is one pixel:
//   .  nothing (see-through)
//   o  outline
//   e  eye, nose or mouth (always dark)
//   w  white
//   b  body color      (different for each animal)
//   l  light color     (belly, ears or spots)
//   p  accent color    (nose, beak or inside of the ears)
// The colors themselves are CSS variables at the top of styles.css.

// Every picture is drawn inside a square of 12 x 12 pixels.
const PET_SIZE = 12;

// The egg. Its color depends on the animal inside.
const EGG = [
  "..oooo..",
  ".obbbbo.",
  "oblbbbbo",
  "obbbblbo",
  "obbbbbbo",
  "oblbbbbo",
  ".obbbbo.",
  "..oooo.."
];

// The bottom half of a cracked shell. It is drawn on top of the baby
// picture to make the "hatchling" stage.
const SHELL = [
  "........",
  "........",
  "........",
  "........",
  "........",
  "ow.ww.wo",
  "owwwwwwo",
  ".oooooo."
];

// The animals. "baby" is 8 x 8 pixels and "adult" is 12 x 12.
const PETS = [
  {
    id: "cat",
    name: "Cat",
    baby: [
      "oo....oo",
      "obo..obo",
      "obboobbo",
      "obebbebo",
      "obbppbbo",
      "obllllbo",
      ".obbbbo.",
      "..oooo.."
    ],
    adult: [
      ".oo......oo.",
      "obpo....opbo",
      "obbboooobbbo",
      "obbbbbbbbbbo",
      "obbebbbbebbo",
      "obbbbppbbbbo",
      ".obbbbbbbbo.",
      "..obbllbbo.o",
      "..obllllbobo",
      "..obllllboo.",
      "..obboobbo..",
      "..oooooooo.."
    ]
  },
  {
    id: "dog",
    name: "Dog",
    baby: [
      "..oooo..",
      "oobbbboo",
      "olbbbblo",
      "olebbelo",
      "olbeeblo",
      ".obwwbo.",
      ".obbbbo.",
      "..oooo.."
    ],
    adult: [
      "..oooooooo..",
      "oobbbbbbbboo",
      "olbbbbbbbblo",
      "olbebbbbeblo",
      "olbbbeebbblo",
      "oobbwwwwbboo",
      ".obbbwwbbbo.",
      "..obbwwbbo.o",
      "..obwwwwbobo",
      "..obwwwwboo.",
      "..obboobbo..",
      "..oooooooo.."
    ]
  },
  {
    id: "bunny",
    name: "Bunny",
    baby: [
      ".o....o.",
      "opo..opo",
      "opo..opo",
      "obboobbo",
      "obebbebo",
      "obbppbbo",
      ".obllbo.",
      "..oooo.."
    ],
    adult: [
      ".oo......oo.",
      ".opo....opo.",
      ".opo....opo.",
      "obbboooobbbo",
      "obbebbbbebbo",
      "obbbbppbbbbo",
      ".obbbbbbbbo.",
      "..obbllbbo..",
      "..obllllbo..",
      "..obllllbo..",
      "..obboobbo..",
      "..oooooooo.."
    ]
  },
  {
    id: "fox",
    name: "Fox",
    baby: [
      "oo....oo",
      "obo..obo",
      "obboobbo",
      "obebbebo",
      "owwbbwwo",
      "owweewwo",
      ".owwwwo.",
      "..oooo.."
    ],
    adult: [
      ".oo......oo.",
      "obbo....obbo",
      "obbboooobbbo",
      "obbbbbbbbbbo",
      "obbebbbbebbo",
      "owwwbeebwwwo",
      ".owwwwwwwwo.",
      "..obbllbbo.o",
      "..obllllbobo",
      "..obllllbowo",
      "..obboobbo..",
      "..oooooooo.."
    ]
  },
  {
    id: "frog",
    name: "Frog",
    baby: [
      ".oo..oo.",
      "obboobbo",
      "obebbebo",
      "obbbbbbo",
      "obeeeebo",
      "obllllbo",
      ".obbbbo.",
      "..oooo.."
    ],
    adult: [
      ".ooo....ooo.",
      "owewo..owewo",
      "obbbboobbbbo",
      "obbbbbbbbbbo",
      "obbbbbbbbbbo",
      "obeeeeeeeebo",
      ".obbbbbbbbo.",
      "..obbllbbo..",
      "..obllllbo..",
      "..obllllbo..",
      "obbbboobbbbo",
      "oooooooooooo"
    ]
  },
  {
    id: "duck",
    name: "Duck",
    baby: [
      "..oooo..",
      ".obbbbo.",
      "obbbbbbo",
      "obebbebo",
      "obbppbbo",
      "obbbbbbo",
      ".obllbo.",
      "..oooo.."
    ],
    adult: [
      "....oooo....",
      "...obbbbo...",
      "..obbbbbbo..",
      "..obebbebo..",
      "..obppppbo..",
      "..obbbbbbo..",
      "...obbbbo...",
      ".obbbllbbbo.",
      "obbbllllbbbo",
      ".obbbbbbbbo.",
      "..oooooooo..",
      "...pp..pp..."
    ]
  }
];

// Find one animal by its id, e.g. findPet("fox").
// If the id is unknown, use the first animal so nothing breaks.
function findPet(petId) {
  const pet = PETS.find(function (pet) {
    return pet.id === petId;
  });
  return pet || PETS[0];
}

// Read one color from the CSS variables in styles.css.
// Example: cssColor("--pet-cat-body")
function cssColor(variableName) {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// Work out which color each picture character stands for, for one animal.
function petColors(petId) {
  return {
    o: cssColor("--pet-outline"),
    e: cssColor("--pet-eye"),
    w: cssColor("--pet-white"),
    b: cssColor("--pet-" + petId + "-body"),
    l: cssColor("--pet-" + petId + "-light"),
    p: cssColor("--pet-" + petId + "-accent")
  };
}

// Paint one picture onto a canvas, one small square per character.
// Pictures smaller than 12 x 12 are centered and sit on the bottom edge.
function paintRows(context, rows, colors) {
  const left = Math.floor((PET_SIZE - rows[0].length) / 2);
  const top = PET_SIZE - rows.length;

  rows.forEach(function (row, y) {
    for (let x = 0; x < row.length; x++) {
      const color = colors[row[x]];   // undefined for "." (nothing)
      if (color) {
        context.fillStyle = color;
        context.fillRect(left + x, top + y, 1, 1);
      }
    }
  });
}

// Draw an animal at one stage of growth on a <canvas>.
// stageId is "egg", "hatchling", "young" or "adult".
// The canvas is only 12 x 12 pixels; styles.css stretches it and keeps
// the pixels sharp, which gives the chunky pixel-art look.
function drawPet(canvas, petId, stageId) {
  const pet = findPet(petId);
  const colors = petColors(pet.id);

  // Setting the size also wipes the canvas clean.
  canvas.width = PET_SIZE;
  canvas.height = PET_SIZE;
  const context = canvas.getContext("2d");

  if (stageId === "egg") {
    paintRows(context, EGG, colors);
  } else if (stageId === "hatchling") {
    paintRows(context, pet.baby, colors);
    paintRows(context, SHELL, colors);   // shell on top of the baby
  } else if (stageId === "young") {
    paintRows(context, pet.baby, colors);
  } else {
    paintRows(context, pet.adult, colors);
  }
}
