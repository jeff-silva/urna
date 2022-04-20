<template>
  <div>
    <button type="button" class="btn btn-primary" @click="candidatoNew={}">
      Novo candidato
    </button>

    <el-dialog title="Candidato" :visible="!!candidatoNew" @close="candidatoNew=false">
      <div class="row">
        <div class="col-12 mb-3">
          <div class="form-label">Nome</div>
          <input type="text" class="form-control" v-model="candidatoNew.name" :class="{'is-invalid':validate.fields.name}">
          <div class="text-danger">{{ validate.get('name') }}</div>
        </div>

        <div class="col-12 mb-3">
          <div class="form-label">Número</div>
          <input type="text" class="form-control" v-model="candidatoNew.number" :class="{'is-invalid':validate.fields.number}">
          <div class="text-danger">{{ validate.get('number') }}</div>
        </div>
        
        <div class="col-12 mb-3">
          <div class="form-label">Foto</div>
          <input type="file" class="form-control" @change="fileToBase64($event.target.files[0])" :class="{'is-invalid':validate.fields.photo}">
          <div class="text-danger">{{ validate.get('photo') }}</div>
          <div>https://randomuser.me/api/portraits/men/43.jpg</div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn btn-success" @click="candidatoAdd(); candidatoNew=false;" :disabled="validate.invalid">
          Salvar
        </button>
      </template>
    </el-dialog>

    <div class="row">
      <div class="col-4" v-for="c in candidatos">
        <div class="card mb-4">
          <div class="card-header">{{ c.name }}</div>
          <div class="card-body">
            <img :src="c.photo" alt="" style="object-fit:cover; width:100%; height:100px;" v-if="c.photo.includes('data:image')">
            <div v-else="c.photo.slice(0, 5)" style="height:100px"></div>
            <div>{{ c.number }}</div>
          </div>
          <div class="card-footer">
            <button type="button" class="btn btn-danger" @click="candidatoDelete(c)">
              Deletar
            </button>
            <button type="button" class="btn btn-success" @click="candidatoNew={...c}">
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
    

    <!-- <pre>$data: {{ $data }}</pre> -->
  </div>
</template>

<script>
export default {
  methods: {
    candidatoAdd() {
      this.candidatos.push({...this.candidatoNew});
    },

    async candidatoDelete(item) {
      await Database.delete('candidatos', item);
      this.candidatos = await Database.all('candidatos');
    },

    async fileToBase64(file) {
      let r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => {
        this.candidatoNew.photo = r.result;
      };
    },

    database() {
      
    },
  },

  computed: {
    validate() {
      return this.$validate(this.candidatoNew, {
        name: {
          presence: {allowEmpty:false},
        },
        number: {
          presence: {allowEmpty:false},
          numericality: true,
        },
        photo: {
          presence: {allowEmpty:false},
        },
      });
    },
  },

  watch: {
    candidatos: {deep:true, async handler(candidatos) {
      candidatos.forEach(candidato => {
        Database.save('candidatos', candidato);
      });
    }},
  },

  data() {
    return {
      candidatos: [],
      candidatoNew: false,
      // db: this.database(),
    };
  },

  async mounted() {
    this.candidatos = await Database.all('candidatos');
  },
}

class Database {
  static async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('test', 1);
      request.onerror  = (err) => { reject(err); };
      request.onsuccess = (e) => { resolve(e.target.result); };
      request.onupgradeneeded = e => {
        let db = e.target.result;
        let objectStore = db.createObjectStore("candidatos", { autoIncrement: true, keyPath:'id' });
      };
    });
  }

  static async save(table, item) {
    let db = await this.init();
    let transaction = db.transaction([table], "readwrite");
    let objectStore = transaction.objectStore(table);
    let objectStoreRequest = objectStore.add(item);
    objectStoreRequest.onsuccess = () => {
      // 
    };
  }

  static async all(table) {
    let db = await this.init();
    let trans = db.transaction([table], 'readonly');
    // trans.oncomplete = e => { resolve(cats); };

    let store = trans.objectStore(table);
		
		let items = [];
		store.openCursor().onsuccess = e => {
			let cursor = e.target.result;
			if (cursor) {
				items.push(cursor.value)
				cursor.continue();
			}
		};

    return items;
  }

  static async delete(table, item) {
    let db = await this.init();
    return new Promise((resolve, reject) => {
      let trans = db.transaction([table], 'readwrite');
      trans.oncomplete = e => { resolve(); };
      let store = trans.objectStore(table);
      store.delete(item.id);
    });
  }
}
</script>

