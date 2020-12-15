var mixin = {
  data: function () {
    return {
      tytul: "dummy"
    }
  },
  methods: {
    setCookie: function (cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toGMTString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function (cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
  }
}

Vue.component('ocena-input', {
  props: {
    oceny: Array,
    ocenyhipotetyczne: Array,
    wagiinput: Array,
    ocenyinput: Array
  },
  data: function () {
    return {      
      aktualnawaga: 0,//{ label: 'x1', value: 1 }
      czyocenyfaktyczne: true,
      sredniainput: '',
      wagainput: null,
      liczbaoceninput: 1,      
    }
  },
  template: `  
  <b-container style="margin-bottom:1em;">
    <div><b-button-group size="sm">
    <b-button :pressed="czyocenyfaktyczne" variant="outline-secondary" @click="ocenyfaktycznehipotetyczneswitch('faktyczne')">Oceny faktyczne</b-button>
    <b-button :pressed="!czyocenyfaktyczne" variant="outline-secondary" @click="ocenyfaktycznehipotetyczneswitch('hipotetyczne')">Oceny hipotetyczne</b-button>
    </b-button-group></div><br>
    <b-button style="min-width:2.3em; margin-bottom:1em;" class="mr-1" pill size="sm" @click="setAktualnaWaga(waga)" v-bind:variant="(waga.value==wagiinput[aktualnawaga].value)?'secondary':'outline-dark'" 
      v-for="waga in wagiinput"
      :key="waga.value"           
    >{{waga.label}}</b-button>
    </b-col></b-row><b-row><b-col>
      <b-button style="width:2.3em;" class="mr-1 mb-1" pill size="sm" v-bind:variant="(czyocenyfaktyczne)?'outline-dark':'dark'" @click="addOcena(ocenainput.label,wagiinput[aktualnawaga].label,ocenainput.value,wagiinput[aktualnawaga].value,true,czyocenyfaktyczne)" 
      v-for="ocenainput in ocenyinput"
      :key="ocenainput.value"           
    >{{ocenainput.label}}</b-button><b-button v-if="!czyocenyfaktyczne" style="width:2.3em;" class="mr-1 mb-1" pill size="sm" variant="dark" v-b-modal.modal-prevent-closing>?</b-button>
    </b-col></b-row>

    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Dodawanie ocen"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
      >
      <form ref="form" @submit.stop.prevent="handleSubmit">       
        <b-form-group          
          label="Średnia, którą chcesz osiągnąć"
          label-for="srednia-input"
          invalid-feedback="Średnia musi być liczbą z przedziału od 1 do 6.9999"
          _description="Podaj wartość w postaci: 0.0000"
        >
          <b-form-input
            id="srednia-input"
            v-model="sredniainput"
            :state="sredniaState"
            maxlength="6"
            required
            
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Waga ocen, które mają być użyte"
          label-for="waga-input"
          invalid-feedback="Waga musi byc podana"
        >
          <b-form-select
            id="waga-input"            
            v-model="wagainput"
            :state="(wagainput?true:null)"            
            required
            :options="wagiinput.map(mapWagiInput)"            
          ></b-form-select>
        </b-form-group>
        <b-form-group
          label="Liczba ocen"
          label-for="liczbaocen-input"
          invalid-feedback="Liczba ocen musi być liczbą z przedziału 1 do 20"
          description="Podaj liczbę ocen z przedziału 1 do 20"
        >
          <b-form-input
            id="liczbaocen-input"
            type="number"
            v-model="liczbaoceninput"
            :state="((!liczbaoceninput || 0 === liczbaoceninput.length)?null:((liczbaoceninput>=1&&liczbaoceninput<=20)?true:false))"
            min="1"
            max="20"
            required
          ></b-form-input>
        </b-form-group>

      </form>
      <!--<small>Debug:<br>
      średnia: {{sredniainput}}<br>
      waga: {{wagainput}}<br>
      liczba ocen: {{liczbaoceninput}}<br>
      </small>-->
    </b-modal>
  </b-container>
  `,  
  computed: {
    sredniaState: function() {
        if (this.sredniainput.length==0) return null;
        return (!isNaN(this.sredniainput.replace(',', '.')) && this.sredniainput.replace(',', '.') >= 1 && this.sredniainput.replace(',', '.') < 7) ? true : false;
      }
  },
  methods: {    
    mapWagiInput: function(waga) {
      return { value: waga, text: waga.label }
    },
    ocenyfaktycznehipotetyczneswitch: function (skad) {
      if((skad=='faktyczne') && !this.czyocenyfaktyczne) {
        this.czyocenyfaktyczne=true;
      }else if((skad=='hipotetyczne') && this.czyocenyfaktyczne) {
        this.czyocenyfaktyczne=false;
      }
    },
    setAktualnaWaga: function (waga) {
      this.aktualnawaga = this.wagiinput.indexOf(waga);
    },
    addOcena: function (ocenalabel, wagalabel, ocena, waga, czyLiczyc, czyocenyfaktyczne) {
      let i = Date.now().toString(36) + Math.random().toString(36).substr(2);
      if (czyocenyfaktyczne) {
      this.oceny.push({ id: i, wartosclabel: ocenalabel, wagalabel: wagalabel, wartosc: ocena, waga: waga, czyLiczyc: czyLiczyc });
      } else {
        this.ocenyhipotetyczne.push({ id: i, wartosclabel: ocenalabel, wagalabel: wagalabel, wartosc: ocena, waga: waga, czyLiczyc: czyLiczyc });
      }
    },
    checkFormValidity() {
        const valid = this.$refs.form.checkValidity();
        const valid2 = (!isNaN(this.sredniainput.replace(',', '.')) && this.sredniainput.replace(',', '.') >= 1 && this.sredniainput.replace(',', '.') < 7) ? true : false;
        // const sredniavalid = (!isNaN(this.sredniainput) && this.sredniainput > 1 && this.sredniainput < 7) ? true : false;       
        console.log("checkFormValidity: "+valid+" "+valid2);
        return valid&&valid2
    },
    resetModal() {
      // this.sredniainput = '5.27';
      // this.wagainput = this.wagiinput[1];
      // this.liczbaoceninput = 3;
      if (!this.wagainput ) {this.wagainput = this.wagiinput[0];}
      //this.liczbaoceninput = 1;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      this.handleSubmit()
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) return
      // Push the name to submitted names
      //this.submittedNames.push(this.name)
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-prevent-closing')
      })
      var liczbaocen = this.liczbaoceninput;
      const docelowasrednia = this.sredniainput.replace(',', '.');      
      do {
        var wOcene=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,liczbaocen,this.wagainput.value);
        var ocenawyliczona = wOcene.wyliczona;
        console.log(wOcene);
        var ocenawyznaczona = wyznaczOcene(this.ocenyinput,ocenawyliczona);
        console.log(ocenawyznaczona);
        if(ocenawyznaczona==0) {liczbaocen++}
      }while(ocenawyznaczona==0 && liczbaocen<=20);

      if (liczbaocen>20) {
        this.$bvToast.toast('Oczekiwanej średniej nie da się osiągnąć nawet za pomocą 20 ocen 😢', {
          title: `Ups`,
          variant: 'danger',
          solid: true,
          autoHideDelay: 6000,
        });
        return;
      }

      var liczbaocentmp = 1*liczbaocen;
      
      // do {
      //   var ocenawyliczona=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,liczbaocentmp,this.wagainput.value).wyliczona;
      //   var ocenawyznaczona = wyznaczOcene(this.ocenyinput,ocenawyliczona);
      //   let i = Date.now().toString(36) + Math.random().toString(36).substr(2);
      //   this.ocenyhipotetyczne.push({ id: i, wartosclabel: ocenawyznaczona.label, wagalabel: this.wagainput.label, wartosc: ocenawyznaczona.value, waga: this.wagainput.value, czyLiczyc: true });
      // }while(--liczbaocentmp);
      
      console.log("liczba ocen tmp: "+liczbaocentmp);

      if (liczbaocentmp==1) {
        console.log("--case 1");
        do {
          var ocenawyliczona=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,liczbaocentmp,this.wagainput.value).wyliczona;
          var ocenawyznaczona = wyznaczOcene(this.ocenyinput,ocenawyliczona);
          var i = Date.now().toString(36) + Math.random().toString(36).substr(2);
          this.ocenyhipotetyczne.push({ id: i, wartosclabel: ocenawyznaczona.label, wagalabel: this.wagainput.label, wartosc: ocenawyznaczona.value, waga: this.wagainput.value, czyLiczyc: true });
        }while(--liczbaocentmp);
      }else if(liczbaocentmp==2){
        console.log("--case 2");
        var brakuje=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,2,this.wagainput.value).brakuje;
        var brakujaceoceny = dopasuj2oceny (this.ocenyinput,brakuje);
        var i = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.ocenyhipotetyczne.push({ id: i, wartosclabel: brakujaceoceny.ocena1.label, wagalabel: this.wagainput.label, wartosc: brakujaceoceny.ocena1.value, waga: this.wagainput.value, czyLiczyc: true });
        i = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.ocenyhipotetyczne.push({ id: i, wartosclabel: brakujaceoceny.ocena2.label, wagalabel: this.wagainput.label, wartosc: brakujaceoceny.ocena2.value, waga: this.wagainput.value, czyLiczyc: true });
      }else{
        console.log("--case def");
        liczbaocentmp=liczbaocentmp-2;
        do {
          var ocenawyliczona=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,liczbaocentmp+2,this.wagainput.value).wyliczona;
          var ocenawyznaczona = wyznaczOcene(this.ocenyinput,ocenawyliczona);
          var i = Date.now().toString(36) + Math.random().toString(36).substr(2);
          this.ocenyhipotetyczne.push({ id: i, wartosclabel: ocenawyznaczona.label, wagalabel: this.wagainput.label, wartosc: ocenawyznaczona.value, waga: this.wagainput.value, czyLiczyc: true });
        }while(--liczbaocentmp);
        var brakuje=wyliczOcene(this.oceny,this.ocenyhipotetyczne,docelowasrednia,2,this.wagainput.value).brakuje;
        var brakujaceoceny = dopasuj2oceny (this.ocenyinput,brakuje);
        var i = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.ocenyhipotetyczne.push({ id: i, wartosclabel: brakujaceoceny.ocena1.label, wagalabel: this.wagainput.label, wartosc: brakujaceoceny.ocena1.value, waga: this.wagainput.value, czyLiczyc: true });
        i = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.ocenyhipotetyczne.push({ id: i, wartosclabel: brakujaceoceny.ocena2.label, wagalabel: this.wagainput.label, wartosc: brakujaceoceny.ocena2.value, waga: this.wagainput.value, czyLiczyc: true });
      }

      // var brakuje=21.43;
      // var wagainput=2;    
      // var ocenyinput = this.ocenyinput;
      // var brakujex1 = brakuje/wagainput;

      // var brakujaceoceny = dopasuj2oceny (this.ocenyinput,brakujex1);
      // console.log("\n"+JSON.stringify(brakujaceoceny));

      function dopasuj2oceny(ocenyinput,brakuje) {
        var ocenyinputtmp = ocenyinput.map(ocenyinputtmpmap);
        ocenyinputtmp.forEach(ocenyinputtmpdiff);
        ocenyinputtmp.sort( function(a, b){
          if (a.diff==b.diff) {return (a.ocenydiff<b.ocenydiff)?-1:1;}
          return (a.diff<b.diff)?1:-1; 
        });
        //console.log(JSON.stringify(ocenyinputtmp));
        //console.log("\n"+JSON.stringify(ocenyinputtmp[0]));
        return ocenyinputtmp[0];

        function ocenyinputtmpdiff(item) {
          ocenyinput.forEach(d1);

          function d1(item2) {
            var delta = brakuje-item2.value-item.ocena1.value;
            if(delta<=0 && delta>item.diff) {
              item.diff=delta;
              item.ocena2=item2;
              item.ocenydiff=Math.abs(item.ocena1.value-item2.value);
            }
          }
        }

        function ocenyinputtmpmap(item) {
          return {ocena1: item, ocena2:null, diff:-1, ocenydiff:999}
        }
      }
            
      function wyznaczOcene(ocenyinput, ocenawyliczona) {
        var ocenawyznaczona=null;
        var diffmin=9999999999;
        ocenyinput.forEach(wylicz);
        return ocenawyznaczona;
        
        function wylicz(item) {
          var diff = item.value-ocenawyliczona;
          if(diff>=0 && diff<diffmin){
            ocenawyznaczona = item;
            diffmin=diff;
          }
        }
      }

      function wyliczOcene(oceny, ocenyhipotetyczne, docelowasrednia, liczbaocen, waga) {
        var wartosci = 0;
        var wagi = 0;      
        oceny.forEach(licz);
        ocenyhipotetyczne.forEach(licz);
        brakujewartosci = (docelowasrednia * (wagi+(liczbaocen*waga))) - wartosci;
        console.log("wartości: "+wartosci+" wagi: "+wagi+"\nBrakuje: "+ brakujewartosci.toFixed(4)+"\nLiczba ocen: "+liczbaocen + " ocena: "+(brakujewartosci/liczbaocen/waga));
        return ({wyliczona:(brakujewartosci/liczbaocen/waga).toFixed(4), brakuje: (brakujewartosci/waga).toFixed(4)})

        function licz(item) {
          if (item.czyLiczyc) {
            wartosci += item.wartosc * item.waga;
            wagi += item.waga;
          }
        }
      }

    }
  }
})

Vue.component('ocena', {
  template: `
    <div class="ocena" >
      <div v-bind:class="[{ocenaoff: !ocena.czyLiczyc}, rodzaj]">{{ ocena.wartosclabel }}</div>
      <!--<div id="del" @click="removeItem(ocena)">X</div>-->
      <div class="ocena-trash ocena-actions-back" @click="removeItem(ocena)"><b-icon icon="trash" /></div>
      <div v-if="!ocena.czyLiczyc" @click="setCzyLiczyc(true)" class="ocena-eye ocena-actions-back"><b-icon icon="eye" /></div>
      <div v-if="ocena.czyLiczyc" @click="setCzyLiczyc(false)" class="ocena-eye ocena-actions-back"><b-icon icon="eye-slash" /></div>
      <div class="ocena-waga" v-bind:class="{ocenaoff: !ocena.czyLiczyc}"><b-badge pill variant="light">{{ ocena.wagalabel }}</b-badge></div>
    </div>
    `,
  methods: {
    removeItem: function (ocena) {
      let trashedItemIndex = this.oceny.indexOf(ocena)
      this.oceny.splice(trashedItemIndex, 1)
    },
    setCzyLiczyc: function (czyLiczyc) {
      this.ocena.czyLiczyc = czyLiczyc;
    }
  },
  props: {
    ocena: Object,
    oceny: Array,
    rodzaj: String
  },
  // created() { console.log("ocena: created"); },
  // mounted() { console.log("ocena: mounted"); },
  // beforeCreate() { console.log("ocena: beforeCreate"); },
  // beforeMount() { console.log("ocena: beforeMount"); },
  // beforeUpdate() { console.log("ocena: beforeUpdate"); },
  // updated() { console.log("ocena: updated"); },
  // beforeDestroy() { console.log("ocena: beforeDestroy"); },
  // destroyed() { console.log("ocena: destroyed"); },
})

Vue.component('srednia', {
  mixins: [mixin],
  template: `
  <b-container style="margin-bottom:1em;">
    <div style="display:table;">
      <span style="font-size:1.2em; display:table-cell; vertical-align:middle;">Średnia: </span>
      <span style="font-size:2em; display:table-cell; vertical-align: middle;">&nbsp;{{srednia(oceny)}}&nbsp;</span>    
      <span v-if="ocenyhipotetyczne.length" style="border-radius: 5px; font-size:1.5em; display:table-cell; vertical-align: middle; color:white; background-color: black;padding: 0.2em;">{{sredniahip(oceny, ocenyhipotetyczne)}}</span>
    </div>
  </b-container>
    `,
  methods: {
    srednia: function (oceny) {
      var wartosci = 0;
      var wagi = 0;      
      oceny.forEach(licz);
      return (wartosci / wagi ? wartosci / wagi : 0).toFixed(4);

      function licz(item) {
        if (item.czyLiczyc) {
          wartosci += item.wartosc * item.waga;
          wagi += item.waga;
        }
      }
    },
    sredniahip: function (oceny, ocenyhipotetyczne) {
      var wartosci = 0;
      var wagi = 0;      
      oceny.forEach(licz);
      ocenyhipotetyczne.forEach(licz);
      return (wartosci / wagi ? wartosci / wagi : 0).toFixed(4);

      function licz(item) {
        if (item.czyLiczyc) {
          wartosci += item.wartosc * item.waga;
          wagi += item.waga;
        }
      }
    },
  },
  props: {
    oceny: Array,
    ocenyhipotetyczne: Array
  },
  created() { console.log("srednia: created"); },
  mounted() { console.log("srednia: mounted"); },
  beforeCreate() { console.log("srednia: beforeCreate"); },
  beforeMount() { console.log("srednia: beforeMount"); },
  beforeUpdate() { console.log("srednia: beforeUpdate "); },
  updated() {
    var ocenycookie = JSON.stringify(this.oceny);
    this.setCookie('oceny', ocenycookie, 180);
    ocenycookie = JSON.stringify(this.ocenyhipotetyczne);
    this.setCookie('ocenyhipotetyczne', ocenycookie, 180);
    // console.log("srednia: updated. ocenycookie: "+ocenycookie);
    // var ocenycookie2 = this.getCookie('oceny');
    // console.log("srednia: ocenycoockie: "+ocenycookie2);
  },
  beforeDestroy() { console.log("srednia: beforeDestroy"); },
  destroyed() { console.log("srednia: destroyed"); },
})

Vue.component('custom-main', {
  mixins: [mixin],
  data: function () {
    return {
      oceny: [],
      ocenyhipotetyczne: [],
      tytul: "Kalkulator średniej ważonej ocen (grzejan@gmail.com).",
      czyCookieMsg: null,
      settingsShow: false,
      jsonwagiinput: "",
      jsonocenyinput: "",
      wagiinput: [],
      wagidefault: [
        { label: 'x1', value: 1 },
        { label: 'x2', value: 2 },
        { label: 'x3', value: 3 },
        { label: 'x4', value: 4 },
        { label: 'x5', value: 5 },
        { label: 'x6', value: 6 }
      ],
      aktualnawaga: { label: 'x1', value: 1 },
      ocenyinput: [],
      ocenydefault: [
        { label: "1-", value: 0.75 },
        { label: "1", value: 1 },
        { label: "1+", value: 1.5 },
        { label: "2-", value: 1.75 },
        { label: "2", value: 2 },
        { label: "2+", value: 2.5 },
        { label: "3-", value: 2.75 },
        { label: "3", value: 3 },
        { label: "3+", value: 3.5 },
        { label: "4-", value: 3.75 },
        { label: "4", value: 4 },
        { label: "4+", value: 4.5 },
        { label: "5-", value: 4.75 },
        { label: "5", value: 5 },
        { label: "5+", value: 5.5 },
        { label: "6-", value: 5.75 },
        { label: "6", value: 6 },
        { label: "6+", value: 6.5 }
      ],
    }
  },
  template: `
  <b-container v-if="settingsShow" >
    <h4>Konfiguracja</h4>
    <b-form @submit="onSettingsSubmit" @reset="onSettingsReset" >    
    <b-form-row><b-col sm>
    <b-form-group id="wagiinput-group" label="Wagi ocen:" label-for="textarea-wagiinput">
    <!--<b-button variant="light" class="float-right"><b-icon icon="life-preserver" ></b-icon></b-button>-->
    <b-form-textarea
        id="textarea-wagiinput"
        placeholder="Wagi ocen"
        rows="3"
        max-rows="8"
        v-model="jsonwagiinput"
      ></b-form-textarea>
      </b-form-group>
      <b-form-group>
      <b-button class="float-left" variant="outline-danger" @click="onSettingsDefaultWagi()">Domyślne</b-button>
    </b-form-group>
    </b-col><b-col sm>
    <b-form-group id="ocenyinput-group" label="Parametry ocen:" label-for="textarea-ocenyinput">
    <b-form-textarea
        id="textarea-ocenyinput"
        placeholder="Parametry ocen"
        rows="3"
        max-rows="8"
        v-model="jsonocenyinput"
      ></b-form-textarea>
      </b-form-group>
      <b-form-group>
      <b-button class="float-left" variant="outline-danger" @click="onSettingsDefaultOceny()">Domyślne</b-button>
      </b-form-group>
      </b-col></b-form-row>
      <b-button type="submit" variant="primary">OK</b-button>
      <b-button variant="outline-secondary" @click="onSettingsCancel()">Anuluj</b-button>      
    </b-form>
  </b-container>
  <b-container v-else>
    <b-row><b-col>
      <b-container><small>{{tytul}}</small></b-container>
    </b-col></b-row>
    <b-row><b-col class="text-right"><b-button pill  variant="light" @click="settingsOn"><b-icon icon="gear"></b-icon></b-button></b-col></b-row>
    <b-row><b-col>
    <srednia :oceny="oceny" :ocenyhipotetyczne="ocenyhipotetyczne"></srednia>
    </b-col></b-row>
    <b-row><b-col>
    <ocena-input :oceny="oceny" :ocenyhipotetyczne="ocenyhipotetyczne" :wagiinput="wagiinput" :ocenyinput="ocenyinput" ></ocena-input>        
    </b-col></b-row>
    <b-row><b-col>
    <b-container>
    <div v-if="(oceny.length>0)||(ocenyhipotetyczne.length>0)">
    <ocena
      v-for="ocena in oceny"
      :key="ocena.id"
      :ocena="ocena"
      :oceny="oceny"
      :rodzaj="'ocenafaktyczna'"
    ></ocena>
    <ocena
      v-for="ocena in ocenyhipotetyczne"
      :key="ocena.id"
      :ocena="ocena"
      :oceny="ocenyhipotetyczne"
      :rodzaj="'ocenahipotetyczna'"
    ></ocena>
    </div>
    <div v-else><p>Tu pojawią sie Twoje oceny 😊</p><p>Musisz wybrać wagę, a następnie kliknąć ocenę.</p></div>
    </b-container>
    </b-col></b-row>
    <div id="cookiemsg" v-if="czyCookieMsg"><b-container><small><p>Ta aplikacja zapisuje ciasteczka (<b>cookies</b>) w  Twojej przeglądarce, żeby zachować swoje ustawienia oraz wprowadzone przez Ciebie oceny.</p><p>Żadne dane nie są wysyłane poza przeglądarkę.</p></small><b-button size="sm" variant="primary" @click="setCookieMsg()">OK</b-button></b-container></div>
  </b-container> 
  `,
  computed: {
    cookiemsgclass: function () {
      if (this.getCookie('cookiemsg')) {
        this.czyCookieMsg = false;
      } else {
        this.czyCookieMsg = true;
      }
    }
  },
  methods: {
    setCookieMsg: function () {
      this.setCookie('cookiemsg', 'Ta aplikacja zapisuje ciasteczka (cookies) w  Twojej przeglądarce, żeby zachować swoje ustawienia oraz wprowadzone przez Ciebie oceny. Żadne dane nie są wysyłane poza przeglądarkę.', 180);
      this.czyCookieMsg = false;
    },
    settingsOn: function () {
      this.settingsShow = true;
      this.jsonwagiinput = JSON.stringify(this.wagiinput, null, 2);
      this.jsonocenyinput = JSON.stringify(this.ocenyinput, null, 2);
    },
    onSettingsSubmit: function () {
      this.settingsShow = false;
      this.wagiinput = JSON.parse(this.jsonwagiinput);
      this.setCookie('wagiinput', JSON.stringify(this.wagiinput), 180);
      this.ocenyinput = JSON.parse(this.jsonocenyinput);
      this.setCookie('ocenyinput', JSON.stringify(this.ocenyinput), 180);
    },
    onSettingsReset: function () { },
    onSettingsCancel: function () {
      this.settingsShow = false;
    },
    onSettingsDefaultWagi: function () {
      this.jsonwagiinput = JSON.stringify(this.wagidefault, null, 2);
    },
    onSettingsDefaultOceny: function () {
      this.jsonocenyinput = JSON.stringify(this.ocenydefault, null, 2);
    }
  },
  created() { console.log("main: created " + new Date().toLocaleString()); },
  mounted() {
    console.log("main: mounted " + new Date().toLocaleString());
    // this.tytul = 'Kalkulator średniej ważonej ocen (grzejan@gmail.com).';
    var ocenycookie = this.getCookie('oceny');
    // console.log("main: ocenycoockie: " + ocenycookie);
    if (ocenycookie) {
      this.oceny = JSON.parse(ocenycookie);
    }
    var ocenyhipotetycznecookie = this.getCookie('ocenyhipotetyczne');
    // console.log("main: ocenyhipotetycznecoockie: " + ocenyhipotetycznecookie);
    if (ocenyhipotetycznecookie) {
      this.ocenyhipotetyczne = JSON.parse(ocenyhipotetycznecookie);
    }
    if (this.getCookie('cookiemsg')) {
      this.czyCookieMsg = false;
    } else {
      this.czyCookieMsg = true;
    }
    var wagicookie = this.getCookie('wagiinput');
    //console.log('wagicookie: "' + wagicookie + '"');
    if (wagicookie) {
      this.wagiinput = JSON.parse(wagicookie);
    } else {
      this.wagiinput = this.wagidefault;
    }
    var ocenycookie = this.getCookie('ocenyinput');
    if (ocenycookie) {
      this.ocenyinput = JSON.parse(ocenycookie);
    } else {
      this.ocenyinput = this.ocenydefault;
    }

    // testy
    var brakuje=21.43;
    var wagainput=2;    
    var ocenyinput = this.ocenyinput;
    var brakujex1 = brakuje/wagainput;

    var brakujaceoceny = dopasuj2oceny (this.ocenyinput,brakujex1);
    console.log("\n"+JSON.stringify(brakujaceoceny));

    function dopasuj2oceny(ocenyinput,brakuje) {
      var ocenyinputtmp = ocenyinput.map(ocenyinputtmpmap);
      ocenyinputtmp.forEach(ocenyinputtmpdiff);
      ocenyinputtmp.sort( function(a, b){
        if (a.diff==b.diff) {return (a.ocenydiff<b.ocenydiff)?-1:1;}
        return (a.diff<b.diff)?1:-1; 
      });
      console.log(JSON.stringify(ocenyinputtmp));
      //console.log("\n"+JSON.stringify(ocenyinputtmp[0]));
      return ocenyinputtmp[0];

      function ocenyinputtmpdiff(item) {
        ocenyinput.forEach(d1);

        function d1(item2) {
          var delta = brakuje-item2.value-item.ocena1.value;
          if(delta<=0 && delta>item.diff) {
            item.diff=delta;
            item.ocena2=item2;
            item.ocenydiff=Math.abs(item.ocena1.value-item2.value);
          }
        }
      }

      function ocenyinputtmpmap(item) {
        return {ocena1: item, ocena2:null, diff:-1, ocenydiff:999}
      }
    }

  },
  beforeCreate() { console.log("main: beforeCreate " + new Date().toLocaleString()); },
  beforeMount() { console.log("main: beforeMount " + new Date().toLocaleString()); },
  beforeUpdate() { console.log("main: beforeUpdate " + new Date().toLocaleString()); },
  updated() {
    console.log("main: updated " + new Date().toLocaleString());
  },
  beforeDestroy() { console.log("main: beforeDestroy " + new Date().toLocaleString()); },
  destroyed() { console.log("main: destroyed " + new Date().toLocaleString()); }
})

let app = new Vue({
  el: '#app'
})