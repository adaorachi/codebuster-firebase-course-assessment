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

  describe('Test users document security rules', () => {
    const displayName = 'Sarah Adams';

    const userDocRef = (uid = myId) => {
      const db = getFirestore(myAuth);
      return db.collection('users').doc(uid);
    };

    it('Allow authenticated user to create their own profile', async () => {
      await createUserDoc();

      const testDoc = userDocRef();
      await firebase.assertSucceeds(
        testDoc.set({ displayName: 'Adaora Chuka', uid: myId })
      );
    });

    it('Allow authenticated user to view and update their own profile', async () => {
      await createUserDoc();
      const testDoc = userDocRef();

      await firebase.assertSucceeds(testDoc.get());
      await firebase.assertSucceeds(testDoc.set({ displayName }));
    });

    it('Allow authenticated user to view other users profile', async () => {
      await createUserDoc(myId);

      const testDoc = userDocRef(theirId);
      await firebase.assertSucceeds(testDoc.get());
    });

    it("Don't allow authenticated user to create or update other users profile if NOT ADMIN", async () => {
      await createUserDoc(myId);

      const testDoc = userDocRef(theirId);

      await firebase.assertFails(testDoc.update({ displayName }));
      await firebase.assertFails(
        testDoc.set({ about: 'I am a developer', isAdmin: false })
      );
    });

    it('Allow authenticated user to update other users profile if ADMIN', async () => {
      const isAdminUser = createUserDoc(myId, true);
      await isAdminUser;

      const isOtherUser = createUserDoc(theirId);
      await isOtherUser;

      const testDoc = userDocRef(theirId);

      await firebase.assertSucceeds(testDoc.update({ displayName }));
    });

    it("Don't allow authenticated user to update their or other users ADMIN profile field", async () => {
      await createUserDoc();

      const testDocOne = userDocRef();
      const testDocTwo = userDocRef(theirId);

      await firebase.assertFails(testDocOne.set({ isAdmin: true }));
      await firebase.assertFails(testDocTwo.update({ isAdmin: false }));
    });

    it("Don't allow authenticated ADMIN user to update the ADMIN profile field", async () => {
      const isAdminUser = createUserDoc(theirId, true);

      await isAdminUser;
      const testDoc = userDocRef();

      await firebase.assertFails(testDoc.set({ isAdmin: true }));
      await firebase.assertFails(testDoc.update({ isAdmin: false }));
    });
  });

  describe('Test any default document security rules', () => {
    it("Don't allow any user to read or write to any document by default", async () => {
      const docId = 'doc123';
      const admin = getAdminFirestore();
      await admin
        .collection('test_documents')
        .doc(docId)
        .set({ content: 'before', authorId: theirId });

      const db = getFirestore(myAuth);
      const testDoc = db.collection('test_documents').doc(docId);
      await firebase.assertFails(testDoc.get());
      await firebase.assertFails(testDoc.update({ content: 'after' }));
      await firebase.assertFails(testDoc.delete());
    });
  });

});

// Delete the firebase app instances after all of our tests have run
afterEach(async () => {
  const cleanUpApps = firebase.apps().map((app) => app.delete());
  await Promise.all(cleanUpApps);
});

