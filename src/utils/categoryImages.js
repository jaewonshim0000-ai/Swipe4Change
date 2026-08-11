// Curated category imagery (all URLs verified). A petition without its own
// image gets one picked deterministically from its category's pool, so the
// same petition always shows the same photo.

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=900&q=60&fit=crop`;

const CATEGORY_IMAGES = {
  Climate: [
    IMG('1466611653911-95081537e5b7'), // wind turbines
    IMG('1470071459604-3b5ec3a7fe05'), // misty ridge
    IMG('1509316975850-ff9c5deb0cd9'), // pine forest
  ],
  'Human Rights': [
    IMG('1573152958734-1922c188fba3'), // protest crowd
    IMG('1529333166437-7750a6dd5a70'), // raised hands
  ],
  Education: [
    IMG('1503676260728-1c00da094a0b'), // classroom
    IMG('1497633762265-9d179a990aa6'), // books
  ],
  Privacy: [
    IMG('1563013544-824ae1b704d3'), // security camera
    IMG('1510511459019-5dda7724fd87'), // keyboard glow
  ],
  Housing: [
    IMG('1570129477492-45c003edd2be'), // house exterior
    IMG('1560518883-ce09059eeffa'), // keys and contract
  ],
  Health: [
    IMG('1576091160399-112ba8d25d1d'), // clinician with tablet
    IMG('1584982751601-97dcc096659c'), // stethoscope
  ],
  Wildlife: [
    IMG('1474511320723-9a56873867b5'), // fox
    IMG('1564349683136-77e08dba1ef7'), // panda
    IMG('1547036967-23d11aacaee0'), // elephant
  ],
  Ocean: [
    IMG('1583212292454-1fe6229603b7'), // sea turtle
    IMG('1439405326854-014607f694d7'), // wave
    IMG('1507525428034-b723cf961d3e'), // shoreline
  ],
};

const hash = (value = '') => {
  let h = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

export const petitionImage = (petition) => {
  if (petition?.imageUrl) return petition.imageUrl;
  const pool = CATEGORY_IMAGES[petition?.category] || CATEGORY_IMAGES.Climate;
  return pool[hash(petition?.id) % pool.length];
};
