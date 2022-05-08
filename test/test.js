const assert = require('assert');
const firebase = require('@firebase/testing');
const { QuerySnapshot } = require('@google-cloud/firestore');

const MY_PROJECT_ID = 'emulator-rules';
const myId = 'user_abc';
const theirId = 'user_xyz';
const modId = 'user_mod';
const myAuth = { uid: myId, email: 'abc@gmail.com' };
const modAuth = { uid: modId, email: 'mod@gmail.com', isModerator: true };

// Enforce firestore rules hot update in emulators
before(async () => {
  const fs = require('fs');
  await firebase.loadFirestoreRules({
    projectId: MY_PROJECT_ID,
    rules: fs.readFileSync('./firestore.rules', 'utf8'),
  });
});

function getFirestore(auth) {
  return firebase
    .initializeTestApp({ projectId: MY_PROJECT_ID, auth })
    .firestore();
}

function getAdminFirestore() {
  return firebase.initializeAdminApp({ projectId: MY_PROJECT_ID }).firestore();
}

// Clear firestore before each test
beforeEach(async () => {
  await firebase.clearFirestoreData({ projectId: MY_PROJECT_ID });
});

describe('Setup', () => {
  it('Understands basic addition, sanity check mocha working', () => {
    assert.equal(2 + 2, 4);
  });
});


describe('Firestore security rules', () => {
  // Test firestore rules

  const createUserDoc = async (uid = myId, isAdmin = false) => {
    const admin = getAdminFirestore();
    await admin
      .collection('users')
      .doc(uid)
      .set({ displayName: 'Dominic Steve', uid, isAdmin });
  };

  describe('Test todo document security rules', () => {
    const docId = 'form123';

    const createTodoDoc = async (uid = myId) => {
      const admin = getAdminFirestore();
      await admin
        .collection('todos')
        .doc(docId)
        .set({ name: 'Learn to fly', uid });
    };

    const todoDocRef = () => {
      const db = getFirestore(myAuth);
      return db.collection('todos').doc(docId);
    };

    it('Allow authenticated user to create their own todo', async () => {
      await createUserDoc();

      const testDoc = todoDocRef();
      await firebase.assertSucceeds(
        testDoc.set({ name: 'Learn to swim', uid: myId })
      );
    });

    it('Allow authenticated user to read, edit, delete their own todo', async () => {
      await createUserDoc();
      await createTodoDoc();

      const testDoc = todoDocRef();

      await firebase.assertSucceeds(testDoc.get());
      await firebase.assertSucceeds(testDoc.update({ name: 'Learn to swim' }));
      await firebase.assertSucceeds(testDoc.delete());
    });

    it("Don't allow authenticated user to read, edit, delete other users todo", async () => {
      await createTodoDoc(theirId);

      const testDoc = todoDocRef();

      await firebase.assertFails(testDoc.get());
      await firebase.assertFails(testDoc.update({ name: 'Learn to swim' }));
      await firebase.assertFails(testDoc.delete());
    });
  });
});

