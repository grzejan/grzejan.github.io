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

Vue.component('dices', {
  props: {
    canHoldSameSymbol: Boolean,
    canRollRepeat: Boolean,
    showDebug: Boolean,
    nextPlayer: Number,
  },
  data: function() {
    return {     
      current:0,
      alwaysCanRoll: false,
      isFirstRoll: true,
      dices:[
        {diceid: 1, value: 4, color: 'yellow', type: 'plain', hold: false, isLocked: false, isRolling: false},
        {diceid: 2, value: 4, color: 'red', type: 'plain', hold: false, isLocked: false, isRolling: false},
        {diceid: 3, value: 4, color: 'blue', type: 'plain', hold: false, isLocked: false, isRolling: false},
        {diceid: 4, value: 4, color: 'green', type: 'plain', hold: false, isLocked: false, isRolling: false},
        {diceid: 5, value: 2, color: 'black', type: 'black', hold: false, isLocked: false, isRolling: false},
      ],
      sides:[
        {sideid: 0, imgPath: 'img/dice_axe.png'},
        {sideid: 1, imgPath: 'img/dice_gandalf.png'},
        {sideid: 2, imgPath: 'img/dice_ork.png'},
        {sideid: 3, imgPath: 'img/dice_nazgul.png'},
        {sideid: 4, imgPath: 'img/dice_ring.png'},
        {sideid: 5, imgPath: 'img/dice_ork.png'},
      ],
      sidesBlack:[
        {sideid: 0, imgPath: 'img/dice_ork.png'},
        {sideid: 1, imgPath: 'img/dice_nazgul.png'},
        {sideid: 2, imgPath: 'img/dice_ring.png'},
        {sideid: 3, imgPath: 'img/dice_ork.png'},
        {sideid: 4, imgPath: 'img/dice_nazgul.png'},
        {sideid: 5, imgPath: 'img/dice_tree.png'},
      ],
      sidesHolded:[
        {imgPath: 'img/dice_axe.png', qty: 0},
        {imgPath: 'img/dice_gandalf.png', qty: 0},
        {imgPath: 'img/dice_ork.png', qty: 0},
        {imgPath: 'img/dice_nazgul.png', qty: 0},
        {imgPath: 'img/dice_ring.png', qty: 0}, 
        {imgPath: 'img/dice_tree.png', qty: 0}, 
      ],
      //canHoldSameSymbol: null,
      //canRollRepeat: null,
      canRollAgain: false,
      rollNumber: 0,
      isAnimating:false,
    }
  },
  template: `
  <div>
    <div ref="listParent">
      <dice 
        v-for="d in dices"
        :key="d.diceid"
        :current="d.value"
        :dice="d"
        :canHold = "!isFirstRoll"
        :sides="(d.type=='black')?sidesBlack:sides" 
        :tabindex="d.diceid"
        @keydown.left.prevent.stop.native="goLeft(d.color)"
        @keydown.right.prevent.stop.native="goRight(d.color)"
        /> <b-button class="dice" ref='ak' :disabled=(!(canRoll||alwaysCanRoll)||isRolling||isAnimating) size="sm" variant="light" @click="roll2" @keydown.left.prevent.stop="goLeft('roll')" @keydown.right.prevent.stop="goRight('roll')"><b-icon icon="dice6" font-scale="2" rotate="0"></b-icon></b-button><b-icon icon="check2-all" font-scale="2"  style="position:relative;left:0px;right:0;top:5px;bottom:0;margin:auto" v-bind:style="{visibility:(allIsLocked)?'visible':'hidden' }"/>
    </div>
    <div v-if=showDebug>
    <hr/>      
    <input v-for="d in dices" v-model.number="d.value" type="number" step="1" maxlength="2" size="2">

    <b-form-checkbox id="canHoldSameSymbol" v-model="canHoldSameSymbol" name="canHoldSameSymbol">canHoldSameSymbol</b-form-checkbox>
    <b-form-checkbox id="canRollRepeat" v-model="canRollRepeat" name="canRollRepeat">canRollRepeat</b-form-checkbox>
    <small><b-form-checkbox id="alwaysCanRoll-1" v-model="alwaysCanRoll" name="alwaysCanRoll-1">alwaysCanRoll</b-form-checkbox>
    <!--<b-form-checkbox id="firstroll" v-model="isFirstRoll" name="firstroll-1">isFirstRoll</b-form-checkbox>
    rollNumber: {{rollNumber}}
    <br/>allishold: {{allishold}}
    <br/>allIsLocked: {{allIsLocked}}
    <br/>isMinOneChosed: {{isMinOneChosed}}
    <br/>isNasgulChosedIfExists: {{isNasgulChosedIfExists}}
    <br/>isHoldOnlyOneInKind: {{isHoldOnlyOneInKind}}
    <br/>isTreeHolded: {{isTreeHolded}}
    <br/>isNoNewHold: {{isNoNewHold}}
    <br/>isRolling: {{isRolling}}
    <br/>canRoll: {{canRoll}}-->
    </small>
    </div>
  </div>  
  `,
  mounted(){
    //this.canHoldSameSymbol=this.canHoldSameSymbolRule;
    //this.canRollRepeat=this.canRollRepeatRule;
    this.$refs.ak.focus();
  },
  methods: {
    displayAllRefs() {
      console.log(this.$refs)
      // this.$refs.listParent.children[1].focus();
    },
    goLeft: function(now) {
      //console.log("arrow left - "+now);
      var left = { roll:4, black:3, green:2, blue:1, red:0, yellow:5 };
      if (!(this.canRoll||this.alwaysCanRoll)||this.isRolling) {left['yellow']=4};
      this.$refs.listParent.children[left[now]].focus();
    },
    goRight: function(now) {
      //console.log("arrow right");
      var right = { roll:0, black:5, green:4, blue:3, red:2, yellow:1 };
      if (!(this.canRoll||this.alwaysCanRoll)||this.isRolling) {right['black']=0};
      this.$refs.listParent.children[right[now]].focus();
    },
    roll2: function() {
      //this.$refs.listParent.children[0].focus();
      if(this.canRollRepeat){this.rollNumber++}
      if(this.canRollRepeat&&!this.isNoNewHold){this.rollNumber=1}
       
      //zablokuj (lock) wszystkie wstrzymane (hold)
      for (d of this.dices) {
        if (d.hold) {d.isLocked=true;}
      };
      //ustaw, ze to są kolejne rolle
      this.isFirstRoll=false; 
      //jezeli wszystkie sa 'locked', to wyzeruj zmienne
      if (this.allIsLocked) {
        //this.isFirstRoll=true;
        this.rollNumber=1;
        for (d of this.dices) {
          d.hold=false;
          d.isLocked=false;}
      }
      // rzuc kostkami
      var los = 0;
      for (d of this.dices) {
        if (!d.hold) {
          los=Math.floor(Math.random() * 6);
          if (d.value==los) {
            los+=6;
          }
          d.value=los;
          }
      };


      
      // for (d of this.dices) {d.hold=true;};
      // setTimeout(function () {for (d of this.dices) {d.hold=false;}}.bind(this), 2500);
      
    },
    next: function() {     
        if (this.current<4) {
          this.current+=1;
        } else {
          this.current=0;
        }
      
    },
    roll: function() {
      var id = setInterval(frame, 15);
      var i=0;
      function frame() {
        if (i > 150) {
          clearInterval(id);
        } else {
          i++;
          this.current=i%5;
          console.log("log: "+i+" "+i%5+ " "+this.current);
        }
      }
    }

  },
  computed: {
    canRoll: function() {
      if ((this.allIsLocked)||this.isFirstRoll) {return true;};
      if(this.canRollRepeat&&this.rollNumber<2&&this.isNoNewHold) {return true;}
      return (this.isMinOneChosed&&this.isNasgulChosedIfExists&&(this.isHoldOnlyOneInKind||this.canHoldSameSymbol));
    },
    allishold: function(){
      var allhold = true;
      for (d of this.dices) {
        if (!d.hold) {allhold=false;}
      }
      return allhold;
    },
    allIsLocked: function(){
      var result = true;
      for (d of this.dices) {if (!d.isLocked) {result=false;}};
      return result;
    },
    isMinOneChosed: function () {
      var result = false;
      for (d of this.dices) {
        if (d.isLocked==false && d.hold==true && !(d.type=='black'&&d.value%6==5)) {result=true;}
      }
      return result;
    },
    isNasgulChosedIfExists: function() {
      var resultNazgul = false;
      var resultNotNazgul = true;
      var s = [];
      for (d of this.dices) {
        s=(d.type=='black')?this.sidesBlack:this.sides;
        if (d.isLocked==false && d.hold==true && s[d.value%6].imgPath=='img/dice_nazgul.png') {resultNazgul=true;}
        if (d.isLocked==false && s[d.value%6].imgPath=='img/dice_nazgul.png') {resultNotNazgul=false;}
      }
      return (resultNazgul||resultNotNazgul);
    },
    isHoldOnlyOneInKind: function() {
      for (s of this.sidesHolded) {s.qty=0;};      
      for (d of this.dices) {
        s=(d.type=='black')?this.sidesBlack:this.sides;
        for (sh of this.sidesHolded) {
          if (d.isLocked==false && d.hold==true && sh.imgPath==s[d.value%6].imgPath) {sh.qty++}
        }
      };
      //console.log(JSON.stringify(this.sidesHolded))
      var holded=0;
      for (s of this.sidesHolded) {if (s.qty>1) {holded++;}};
      //console.log(holded);
      //return (holded==0)&&this.isMinOneChosed;
      return (holded==0);
    },
    isLeftOnlyOneUnlocked: function() {
      var ile = 0;
      for (d of this.dices) {
        if (d.isLocked==false) {ile++;}
      }
      return (ile==1);
    },
    isTreeHolded: function() {
      var result=false;
      var s = [];
      for (d of this.dices) {
        s=(d.type=='black')?this.sidesBlack:this.sides;
        if (d.isLocked==false && d.hold==true && s[d.value%6].imgPath=='img/dice_tree.png') {result=true;}
      }
      return (result);
    },
    isNoNewHold: function() {
      var result=true;
      for (d of this.dices) {
        if(result){
          if(d.isLocked==false&&d.hold==true) {result=false;};
        };
      };
      return result;
    },
    isRolling: function () {
      var result = false;
      for (d of this.dices) {
        if (d.isRolling) {return true;}
      }
      return false;
    },
  },
  watch: {
    nextPlayer: function(newValue) {
      this.isAnimating=false;      
      this.$refs.listParent.children[5].focus();
      console.log("watch:allislocked");           
    },
    isRolling: function(newValue) {
      // przesuń focus na ostatnią aktywną kostkę
      if(newValue){
        var kostka='roll';
        var kostki = { roll:5, black:4, green:3, blue:2, red:1, yellow:0 };
        for (d of this.dices) {
          if(!d.hold) {kostka=d.color};
        };
        console.log(kostka)
        this.$refs.listParent.children[kostki[kostka]].focus();
      };  
      //this.$refs.listParent.children[2].focus();
    },
    allishold: function(newValue){
      if ((newValue&&(this.isHoldOnlyOneInKind||this.canHoldSameSymbol))||(newValue&&this.isLeftOnlyOneUnlocked)) {
        // koniec rzutów
        var dicePlainNames=["AXE","GANDALF","ORK","NAZGUL", "RING","ORK"];
        var diceBlackNames=["ORK","NAZGUL","RING","ORK", "NAZGUL","TREE"];
        var result={};
        for (d of this.dices) {
          d.isLocked=true;
          if (d.type=='plain') {
            result[d.color]=(d.hold)?dicePlainNames[(d.value%6)]:null;
          };
          if (d.type=='black') {
            result[d.color]=(d.hold)?diceBlackNames[(d.value%6)]:null;
          };
        };   
        // this.isAnimating=true;     
        this.$emit('dicesResults', result);
        

      };
    },
    isTreeHolded: function(newValue){
      //newValue&&this.isNasgulChosedIfExists&&this.isMinOneChosed&&this.isHoldOnlyOneInKind
      if (newValue&&this.isNasgulChosedIfExists&&(this.isHoldOnlyOneInKind||this.canHoldSameSymbol)) { 
        // koniec rzutów
        var dicePlainNames=["AXE","GANDALF","ORK","NAZGUL", "RING","ORK"];
        var diceBlackNames=["ORK","NAZGUL","RING","ORK", "NAZGUL","TREE"];
        var result={};
        for (d of this.dices) {
          d.isLocked=true;
          if (d.type=='plain') {
              result[d.color]=(d.hold)?dicePlainNames[(d.value%6)]:null;
            };
          if (d.type=='black') {
              result[d.color]=(d.hold)?diceBlackNames[(d.value%6)]:null;
          };
        };
        // this.isAnimating=true;
        this.$emit('dicesResults', result);
        
      };
    },
  },
})

Vue.component('dice', {
  data: function() {
    return {
      tweenedNumber: 0,
      rollingTime: 5, //def:50
      rollingTimeSlow: 0, //def:100
    }
  },
  props: {    
    current: Number,
    dice: Object,
    sides: Array,
    canHold: Boolean,
  },
  template: `
  <div class="dice" style="display:inline-block;width:50px;height:50px;padding:5px;border-radius:10px;" v-bind:style="{ backgroundColor:dice.color, margin:3+'px', opacity:(dice.hold)?0.5:1 }" @click="hold" @keyup.enter="hold" @keydown.left.prevent.stop="test1" @keydown.right.prevent.stop="test2"><img v-for="s in sides" style="display:none" v-bind:src=s.imgPath /><!--<img v-for="s in sides" v-if="animatedCurrent==s.sideid" v-bind:src=s.imgPath />--><img v-bind:src=sides[animatedCurrent].imgPath />
  </div>  
  `,
  computed: {
    animatedCurrent: function() {
      return (this.tweenedNumber.toFixed(0))%6;
    },
  },
  methods: {
    test1: function() {
      //console.log("dice: arrow left");    
    
    },
    test2: function() {
     //console.log("dice: arrow right");
    },
    hold: function() {
      if(this.canHold && !this.dice.isLocked && !this.dice.isRolling) {
        this.dice.hold=!this.dice.hold
      }
    },
    roll: function() {
      this.tweenedNumber=0;
      // gsap.to(this.$data, { duration: 2.5, tweenedNumber: (60+(this.current%6)) }).then(result => console.log("dice done: "+this.current));      
      var id = setInterval(frame.bind(this), 50);
      var i=0;
      var delays=[{lp:40,delay:180},{lp:38,delay:140},{lp:33,delay:100}];
      function frame() {
        if (i > 42-1+(this.current%6)) {
          clearInterval(id);
        } else {
          i++;
          this.tweenedNumber=i;
          if (i>40) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTime+80);
            } else if (i>38) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTime+40);
            } else if (i>33) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTime);}
          //console.log("log: "+i+" "+i%5);
        }
      };   
    },
    roll2: function(){      
      return new Promise((resolve, reject)=>{
      this.tweenedNumber=0;
      // gsap.to(this.$data, { duration: 2.5, tweenedNumber: (60+(this.current%6)) }).then(result => console.log("dice done: "+this.current));      
      var id = setInterval(frame.bind(this), this.rollingTime);
      var i=0;
      var delays=[{lp:40,delay:180},{lp:38,delay:140},{lp:33,delay:100}];
      function frame() {
        if (i > 42-1+(this.current%6)) {
          clearInterval(id);
          resolve("done");
        } else {
          i++;
          this.tweenedNumber=i;
          if (i>40) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTimeSlow+80);
            } else if (i>38) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTimeSlow+40);
            } else if (i>33) {
            clearInterval(id);           
            id = setInterval(frame.bind(this), this.rollingTimeSlow);}
          //console.log("log: "+i+" "+i%5);
        }
      }
    });
   },
  },
  watch: {
     current: function(newValue) {
       if (!this.dice.isRolling) {
         this.dice.isRolling=true;
         this.roll2().then(result=>{
           this.dice.isRolling=false;
           //console.log("End dice:"+this.dice.diceid+" side:"+this.current+" result:"+result);
           });
        }
       //let promise = new Promise(this.roll());
     },
    //  offtweenedNumber: function(newValue) {
    //    console.log("tweenedNumber: "+newValue);
    //  }

   },
  mounted() { 
    this.tweenedNumber=this.current;
    //console.log(this.$refs.toString);
    //this.$refs.di1.focus();
    //this.roll();
  },
  // beforeCreate() {console.log("bc") },
  // beforeMount() { console.log("bm")},
  // beforeUpdate() { console.log("bu")},
  // updated() { console.log("u")},
  // beforeDestroy() {console.log("bd") },
  // destroyed() {console.log("d") }
})

Vue.component('step-ring', {
  data: function() {
    return {
      stan: 0,
      stanname: 'null',
      stanclass: [
        {id: 0, classname: 'null'},
        {id: 1, classname: 'stepx'},
      ],
      ilerazy: '',   
    }
  },
  template: `
  <div class="step" v-bind:class="[stanname]" v-bind:style="{width: 30*skala+'px',height: 31*skala+'px', backgroundSize: 30*skala+'px '+31*skala+'px', animation: ilerazy }" @click="changeState"></div>
  `,
  methods: {
    changeState: function () {
      this.stan++
      if(this.stan>1) { this.stan=0 }
      //this.stanname=this.stanclass[this.stan].classname;
      //this.ringstep.value=(this.stan==1)?'X':'';

    }
  },
  props: {    
    ringstep: Object,
    skala: Number,
  },
  computed: {
    stanwatched: function() {
      return (this.ringstep.value=='X')?1:0;
    },
  },
  watch: {
    stanwatched: function(newValue) {
      this.stan=newValue;            
      this.ilerazy='';
      setTimeout(function(){ this.ilerazy='zoominoutsinglefeatured 1s 1'; }.bind(this), 50);
      //console.log(JSON.stringify(this.ringstep));
      this.$emit('updateStats', '');
    },
    stan: function(newValue) {
      this.stanname=this.stanclass[this.stan].classname;
      this.ringstep.value=(this.stan==1)?'X':'';
    }
  },
})

Vue.component('step-nazgul', {
  data: function() {
    return {
      stan: 0,
      stanname: 'null',
      stanclass: [
        {id: 0, classname: 'null'},
        {id: 1, classname: 'stepx'},
        {id: 2, classname: 'stepsplit'},
        {id: 3, classname: 'stepsplitx'},
        {id: 4, classname: 'stepsplitxx'},
      ],
      ilerazy: ''      
    }
  },
  template: `
  <div class="step" v-bind:class="[stanname]" v-bind:style="{width: 30*skala+'px',height: 31*skala+'px', backgroundSize: 30*skala+'px '+31*skala+'px', animation: ilerazy }" @click="changeState"></div>
  `,
  methods: {
    changeState: function () {
      this.stan++
      if(this.stan>4) { this.stan=0; }
      this.stanname=this.stanclass[this.stan].classname;
      if (this.stan==0) this.nazgulstep.value='';
      if (this.stan==1) this.nazgulstep.value='X';
      if (this.stan==2) this.nazgulstep.value='|';
      if (this.stan==3) this.nazgulstep.value='X|';
      if (this.stan==4) this.nazgulstep.value='X|X';
 
    }
  },
  props: {
    nazgulstep: Object,
    skala: Number,
  },
  computed: {
   stanwatched: function() {
     if(this.nazgulstep.value=='') return 0;
     if(this.nazgulstep.value=='X') return 1;
     if(this.nazgulstep.value=='|') return 2;
     if(this.nazgulstep.value=='X|') return 3;
     if(this.nazgulstep.value=='X|X') return 4;
     return 0;
   },
  },
  watch: {
    stanwatched: function(newValue) {
      this.stan=newValue;            
      this.ilerazy='';
      setTimeout(function(){ this.ilerazy='zoominoutsinglefeatured 1s 1'; }.bind(this), 50);
      // console.log(JSON.stringify(this.nazgulstep));
      this.$emit('updateStats', '');
    },
    // stan: function(newValue) {
    //   this.ilerazy='';
    //   setTimeout(function(){ this.ilerazy='zoominoutsinglefeatured 1s 1'; }.bind(this), 50);
    //   this.$emit('updateStats', '');
    // },
    stan: function(newValue) {
      this.stanname=this.stanclass[this.stan].classname;
      //this.ringstep.value=(this.stan==1)?'X':'';
      if (this.stan==0) this.nazgulstep.value='';
      if (this.stan==1) this.nazgulstep.value='X';
      if (this.stan==2) this.nazgulstep.value='|';
      if (this.stan==3) this.nazgulstep.value='X|';
      if (this.stan==4) this.nazgulstep.value='X|X';
    }
  },
})

Vue.component('board', {
  mixins: [mixin],
  props: {
    skala: Number,
    boardstate: Object,
  },
  data: function () {
    return {
      character:null,
      boardl: 600,
      boardh: 600,
      qskala: (5/6),
      korektax: -3, 
      korektay: 0,
      ringsteps: 0, //max: 9
      nazgulsteps: 0, // max: 8+nazgulsplits
      ringspath: [],
      nazgulspath: [],
      ringstoend: 0,
    }
  },
  template: `
  <div class="board" v-bind:style="{width: 600*skala+'px',height: 600*skala+'px', backgroundSize: 600*skala+'px' }">&nbsp;  
    
    <div class="character" v-bind:class="{characterx:(character==1)}" v-bind:style="{left: 17*skala+'px', top: 15*skala +'px', width: 75*skala + 'px', height: 100*skala + 'px', backgroundSize: 20*skala+'px'}" @click="setCharacter(1)"></div>
    <div class="character" v-bind:class="{characterx:(character==2)}" v-bind:style="{left: 112*skala+'px', top: 15*skala +'px', width: 75*skala + 'px', height: 100*skala + 'px', backgroundSize: 20*skala+'px'}" @click="setCharacter(2)"></div>
    <div class="character" v-bind:class="{characterx:(character==3)}" v-bind:style="{left: 207*skala+'px', top: 15*skala +'px', width: 75*skala + 'px', height: 100*skala + 'px', backgroundSize: 20*skala+'px'}" @click="setCharacter(3)"></div>
    <div class="character" v-bind:class="{characterx:(character==4)}" v-bind:style="{left: 301*skala+'px', top: 15*skala +'px', width: 75*skala + 'px', height: 100*skala + 'px', backgroundSize: 20*skala+'px'}" @click="setCharacter(4)"></div>

    <step-ring 
      v-for="ring in ringspath"
      :key="ring.step"
      :ringstep="ring"
      :skala="skala"      
      v-bind:style="{ left: ring.x*skala + 'px', top: ring.y*skala + 'px' }"
      @updateStats="updateStats"/>

    <step-nazgul  
      v-for="nazgul in nazgulspath"
      :key="nazgul.step"
      :nazgulstep="nazgul"
      :skala="skala"
      v-bind:style="{ left: nazgul.x*skala + 'px', top: nazgul.y*skala + 'px'}"
      @updateStats="updateStats" />

    <div class="notice" v-bind:style="{width: 280*skala+'px', top: 180*skala+'px', right: 10*skala+'px', lineHeight: 100*skala+'px', height: 100*skala+'px', fontSize: 1.3*skala+'em' }" ><p>{{notice}}</p></div>

    <div v-if="false" style="background-color:rgba(255, 255, 255, 0.816);"><small>{{ringspath}}</small></div>
 
  </div> 
  `,
  computed: {
    notice: function () {      
      var note=['Tutaj pojawi się opis akcji specjalnej ze ścieżki pierścienia',
      'Odkładanie takich samych symboli',
      'Gandalf się nie liczy',
      'Broń x2',
      'Każdy rzut można powtórzyć 1 raz',
      'Orkowie x2',
      'Nazgul się nie liczy',
      'Liczą się wszystkie Nazgule',
      '-1 pierścień',
      'Koniec?'];
      var i=0;

      var nazgollose=true;
      for (i = 1; i <= this.nazgulspath.length; i++) {
        var step = this.nazgulspath[i-1].value;
        if (step==''||step=='|'||step=='X|') {
          nazgollose=false;
          break;
        };
      };
      if (nazgollose) return 'Nazgule Cię dopadły. Przegrywasz.';

      var ringwin=true;
      for (i = 1; i <= this.ringspath.length; i++) {
        if (this.ringspath[i-1].value=='') {
          ringwin=false;
          break;
        };
      };
      if (ringwin) return 'Udało Ci się zniszczyć pierścień. Wygrywasz!';

      for (i = this.ringspath.length; i >= 1; i--) {
        if (this.ringspath[i-1].value=='X') return note[i];
      };
      return note[i];
    }
  },
  mounted() { 
    this.character=this.boardstate.character;
    this.ringspath=this.boardstate.ringspath;
    this.nazgulspath=this.boardstate.nazgulspath;
   },
  // beforeCreate() {console.log('bc') },
  // beforeMount() {console.log('bm') },
  // beforeUpdate() {console.log('bu') },
  // updated() { },
  // beforeDestroy() {console.log('bd') },
  // destroyed() {console.log('d') },
  methods: {
    setCharacter: function(character) {
      if (this.character == character) {
        character = -1;
      };
      this.character = character;
      this.boardstate.character = character;
      //this.$emit('boardstate', this.boardstate);
    },
    updateStats: function() {
      var nazgulstoend=0;
      for (nazgul of this.boardstate.nazgulspath) {
        if (nazgul.value==''||nazgul.value=='X|'||nazgul.value=='|') nazgulstoend++;
        if (nazgul.value=='|') nazgulstoend++;
      };

      var ringstoend=0;
      var rule=0;
      for (ring of this.boardstate.ringspath) {
        if (ring.value=='') ringstoend++;
        if (ring.value=='X') rule=ring.step;
      };
      
      //console.log("r: "+ringstoend+" n: "+nazgulstoend)

      this.boardstate.ringstoend=ringstoend;
      this.boardstate.nazgulstoend=nazgulstoend;
      this.boardstate.rule=rule;
    },
  },
  watch: {
    character: function(newValue) {
      if (newValue==-1) {
        this.boardstate.ringstoend=0;
        this.boardstate.nazgulstoend=0;
      } else {
        this.updateStats();
      }
    }  
  },
})

Vue.component('custom-main', {
  mixins: [mixin],
  data: function() {
    return {      
      tytul: "The Lord of the Rings: Journey to Mordor electronic board (grzejan@gmail.com)",
      w: 400,
      h: 600,
      czyCookieMsg: null,
      isBusy: false,
      boards: [
        {id: 0, name: 'Frodo', bgcolor: 'yellow', txtcolor: 'black',ringstoend: 9, nazgulstoend: 8, character:1, rule:0,
        ringspath: [
            { step:1, x: 179, y: 210, value: '' },
            { step:2, x: 217, y: 273, value: '' },
            { step:3, x: 259, y: 304, value: '' },
            { step:4, x: 297, y: 378, value: '' },
            { step:5, x: 277, y: 425, value: '' },
            { step:6, x: 346, y: 450, value: '' },
            { step:7, x: 437, y: 432, value: '' },
            { step:8, x: 492, y: 450, value: '' },
            { step:9, x: 510, y: 403, value: '' }
          ],
          nazgulspath: [
            { step:11, x: 137, y: 278, split: false, value: '' },
            { step:12, x: 181, y: 330, split: false, value: '' },
            { step:13, x: 239, y: 370, split: false, value: '' },
            { step:14, x: 227, y: 448, split: false, value: '' },
            { step:15, x: 318, y: 498, split: false, value: '' },
            { step:16, x: 423, y: 488, split: false, value: '' },
            { step:17, x: 492, y: 503, split: false, value: '' },
            { step:18, x: 547, y: 443, split: false, value: '' }
          ], 
        },
        {id: 1, name: 'Sam', bgcolor: 'red', txtcolor: '#F0F0F0', ringstoend: 9, nazgulstoend: 8, character:2, rule:0,
        ringspath: [
            { step:1, x: 179, y: 210, value: '' },
            { step:2, x: 217, y: 273, value: '' },
            { step:3, x: 259, y: 304, value: '' },
            { step:4, x: 297, y: 378, value: '' },
            { step:5, x: 277, y: 425, value: '' },
            { step:6, x: 346, y: 450, value: '' },
            { step:7, x: 437, y: 432, value: '' },
            { step:8, x: 492, y: 450, value: '' },
            { step:9, x: 510, y: 403, value: '' }
          ],
          nazgulspath: [
            { step:11, x: 137, y: 278, split: false, value: '' },
            { step:12, x: 181, y: 330, split: false, value: '' },
            { step:13, x: 239, y: 370, split: false, value: '' },
            { step:14, x: 227, y: 448, split: false, value: '' },
            { step:15, x: 318, y: 498, split: false, value: '' },
            { step:16, x: 423, y: 488, split: false, value: '' },
            { step:17, x: 492, y: 503, split: false, value: '' },
            { step:18, x: 547, y: 443, split: false, value: '' }
          ], 
        },
        {id: 2, name: 'Merry', bgcolor: 'blue', txtcolor: '#F0F0F0', ringstoend: 9,  nazgulstoend: 8, character:3, rule:0,
        ringspath: [
            { step:1, x: 179, y: 210, value: '' },
            { step:2, x: 217, y: 273, value: '' },
            { step:3, x: 259, y: 304, value: '' },
            { step:4, x: 297, y: 378, value: '' },
            { step:5, x: 277, y: 425, value: '' },
            { step:6, x: 346, y: 450, value: '' },
            { step:7, x: 437, y: 432, value: '' },
            { step:8, x: 492, y: 450, value: '' },
            { step:9, x: 510, y: 403, value: '' }
          ],
          nazgulspath: [
            { step:11, x: 137, y: 278, split: false, value: '' },
            { step:12, x: 181, y: 330, split: false, value: '' },
            { step:13, x: 239, y: 370, split: false, value: '' },
            { step:14, x: 227, y: 448, split: false, value: '' },
            { step:15, x: 318, y: 498, split: false, value: '' },
            { step:16, x: 423, y: 488, split: false, value: '' },
            { step:17, x: 492, y: 503, split: false, value: '' },
            { step:18, x: 547, y: 443, split: false, value: '' }
          ], 
        },
        {id: 3, name: 'Pippin', bgcolor: 'green', txtcolor: '#F0F0F0', ringstoend: 9, nazgulstoend: 8, character:4, rule:0,
        ringspath: [
            { step:1, x: 179, y: 210, value: '' },
            { step:2, x: 217, y: 273, value: '' },
            { step:3, x: 259, y: 304, value: '' },
            { step:4, x: 297, y: 378, value: '' },
            { step:5, x: 277, y: 425, value: '' },
            { step:6, x: 346, y: 450, value: '' },
            { step:7, x: 437, y: 432, value: '' },
            { step:8, x: 492, y: 450, value: '' },
            { step:9, x: 510, y: 403, value: '' }
          ],
          nazgulspath: [
            { step:11, x: 137, y: 278, split: false, value: '' },
            { step:12, x: 181, y: 330, split: false, value: '' },
            { step:13, x: 239, y: 370, split: false, value: '' },
            { step:14, x: 227, y: 448, split: false, value: '' },
            { step:15, x: 318, y: 498, split: false, value: '' },
            { step:16, x: 423, y: 488, split: false, value: '' },
            { step:17, x: 492, y: 503, split: false, value: '' },
            { step:18, x: 547, y: 443, split: false, value: '' }
          ], 
        }
      ],
      activeBoard: 0,      
      debug:"debug",
      showDebug:false,
      nextPlayer:0,
      //activeOtherPlayers: [],
    }
  },
  template: `
  <div>
    <b-row class="text-center"><b-col>
      <b-container><h5>{{tytul}} <b-button tabindex="-1" pill size="sm" variant="outline-dark" @click="scaleUp()">size up</b-button> <b-button tabindex="-1" pill size="sm" variant="outline-dark" @click="scaleDown()">size down</b-button> <small>{{(w/h*100).toFixed(0)}}%</small></h5></b-container>
    </b-col></b-row>

    <b-container class="text-center">
      <b-icon icon="code-slash" font-scale="1"  style="position:absolute;right:0;top:5px;" @click="showDebug=!showDebug"/>
      <dices :nextPlayer=nextPlayer :showDebug=showDebug :canHoldSameSymbol="boards[activeBoard].rule==1?true:false" :canRollRepeat="boards[activeBoard].rule==4?true:false" @dicesResults="onDicesResults"/>
      <small v-if=showDebug>activeBoard:{{activeBoard}} rule:{{boards[activeBoard].rule}} others: {{activeOtherPlayers}}<br/>{{debug}}</small>      
    </b-container>
    
    <hr/>    
    
    <div class="vertical-container">
      <div class="vertical-center" v-bind:style="{ width: 200+600*w/h+'px'}">
        <div style="display:inline-block;position:relative;"
          v-for="board in boards"
          :key="board.id"   
        >
      <div class="tab" 
      v-bind:style="{ background: board.bgcolor, height: 600*w/h+'px' }"><div class="tabtext" v-bind:style="{ width: 600*w/h+'px', color: board.txtcolor }"
      @click='activeBoard=board.id'
      >{{board.name}}<span style="font-size: 90%;">&nbsp;&nbsp;&nbsp;&nbsp;&#x1F479;&nbsp;{{board.nazgulstoend}}&nbsp;&nbsp;&#x1F48D;&nbsp;{{board.ringstoend}}</span></div></div><div style="display:inline-block;position:relative;overflow:hidden;transition: width .5s;" v-bind:style="{ width: (activeBoard==board.id)*600*w/h+'px', height: 600*w/h+'px' }" v-if='true'>
      <board :skala=w/h :boardstate=board @boardstate="onBoardState">&nbsp;</board></div>  
    </div>    
    </div>
    </div>

    <!--<div>
      <b-button size="sm" @click="doit1">Add SAM's rings</b-button>
    </div>-->

    <div id="cookiemsg" v-if="czyCookieMsg"><b-container><small><p>Ta aplikacja zapisuje ciasteczka (<b>cookies</b>) w  Twojej przeglądarce, żeby zachować swoje ustawienia.</p></small><b-button size="sm" variant="primary" @click="setCookieMsg()">OK</b-button></b-container></div>
    
  </div>
  `,
  methods: {
    doit1: function(){
      this.activeBoard=1; //'Sam'
      setTimeout(function(){
        this.boards[1].ringspath[0].value='X'; 
        this.boards[1].ringspath[1].value='X';
        this.boards[1].nazgulspath[0].value='|';       
      }.bind(this), 700);     
    },
    onBoardState: function(value) {
      //console.log(JSON.stringify(value));
      //this.boards[value.id]=value;
    },
    onDicesResults: function(value) {
      console.log(JSON.stringify(value));      
      this.doRound(value,this.activeBoard,this.activeOtherPlayers,this.boards[this.activeBoard].rule);
    },
    doRound: function(dices, currentPlayer, otherPlayers, rule) {
      //this.debug=JSON.stringify(dices)
      //rule: 2 - gandalf się nie liczy, 3 - broń x2, 5 - orkowie x2, 6 - nazgul się nie liczy, 7 - wszystkie nazgule, 8 - pierścienie -1
      //weryfikacja broń vs orkowie
      //var gandalfrule=(rule==2)?0:1;
      var axesrule=(rule==3)?2:1;
      var orksrule=(rule==5)?2:1;
      var nazgulrule=(rule==6)?0:1;
      // rule==7 - wszystkie nazgule dla gracza
      // rule==8 - rings=(rings>1)?1:0
      var orks = ((dices.yellow=='ORK')?1:0)+((dices.red=='ORK')?1:0)+((dices.blue=='ORK')?1:0)+((dices.green=='ORK')?1:0)+((dices.black=='ORK')?1:0);
      var axes = ((dices.yellow=='AXE')?1:0)+((dices.red=='AXE')?1:0)+((dices.blue=='AXE')?1:0)+((dices.green=='AXE')?1:0)+((dices.black=='AXE')?1:0);
      console.log("orks: "+orks*orksrule+" axes: "+axes*axesrule);
      this.debug="orks: "+orks*orksrule+" axes: "+axes*axesrule;
      //policzenie pierścieni
      var rings = (((dices.yellow=='RING')?1:0)+((dices.red=='RING')?1:0)+((dices.blue=='RING')?1:0)+((dices.green=='RING')?1:0)+((dices.black=='RING')?1:0))*((orks>axes)?0:1);
      if(rule==8) {
        if(rings>1) {rings=1;} else {rings=0;};
      };
      console.log("rings: "+rings);
      this.debug=this.debug+" | rings: "+rings;
      //policzenie gandafów
      var gandalfs=0;
      if (rule!=2) {
        gandalfs = ((dices.yellow=='GANDALF')?1:0)+((dices.red=='GANDALF')?1:0)+((dices.blue=='GANDALF')?1:0)+((dices.green=='GANDALF')?1:0)+((dices.black=='GANDALF')?1:0);
      };
      console.log("gandalfs: "+gandalfs);
      this.debug=this.debug+" | gandalfs: "+gandalfs;
      //policzenie nazguli dla gracza
      //policzenie nazguli dla przeciwników
      var nazgulOtherPlayers=[];
      var nazgulCurrentPlayer=0;
      if (rule==7) {
        nazgulCurrentPlayer = ((dices.yellow=='NAZGUL')?1:0)+((dices.red=='NAZGUL')?1:0)+((dices.blue=='NAZGUL')?1:0)+((dices.green=='NAZGUL')?1:0)+((dices.black=='NAZGUL')?1:0);
      } else {
      if(dices.yellow=='NAZGUL') {if ((currentPlayer==0 || !otherPlayers.includes(0))) {nazgulCurrentPlayer++;} else {nazgulOtherPlayers.push(0);};};
      if(dices.red=='NAZGUL') {if ((currentPlayer==1 || !otherPlayers.includes(1))) {nazgulCurrentPlayer++;} else {nazgulOtherPlayers.push(1);};};
      if(dices.blue=='NAZGUL') {if ((currentPlayer==2 || !otherPlayers.includes(2))) {nazgulCurrentPlayer++;} else {nazgulOtherPlayers.push(2);};};
      if(dices.green=='NAZGUL') {if ((currentPlayer==3 || !otherPlayers.includes(3))) {nazgulCurrentPlayer++;} else {nazgulOtherPlayers.push(3);};};
      if (dices.black=='NAZGUL') {nazgulCurrentPlayer++;};
      nazgulCurrentPlayer=nazgulCurrentPlayer*nazgulrule;
      };

      console.log("nazgulPlayer: "+nazgulCurrentPlayer+" nazgulOthers: "+nazgulOtherPlayers.toString());
      this.debug=this.debug+" | nazgulPlayer: "+nazgulCurrentPlayer+" nazgulOthers: "+nazgulOtherPlayers.toString();

      setTimeout(function(){
        // do aktywnej planszy dodajemy pierścienie
        var ringstmp = rings;
        for (ringstep of this.boards[this.activeBoard].ringspath) {
          if (ringstmp>0 && ringstep.value=='') {
            ringstep.value='X';
            ringstmp--;
          };
        };
        //do aktywnej planszy dodajemy gandalfów
        var gandalfstmp = gandalfs;
        for (nazgulstep of this.boards[this.activeBoard].nazgulspath) {
          if (gandalfstmp>0 && nazgulstep.value=='') {
            nazgulstep.value='|';
            gandalfstmp--;
          };
        };
        //do aktywnej planszy dodajemy nazgule
        var nazgulCurrentPlayertmp = nazgulCurrentPlayer;
        for (nazgulstep of this.boards[this.activeBoard].nazgulspath) {
          if (nazgulCurrentPlayertmp>0 && nazgulstep.value=='') {
            nazgulstep.value='X';
            nazgulCurrentPlayertmp--;
          }; 
          if (nazgulCurrentPlayertmp>0 && nazgulstep.value=='|') {
            nazgulstep.value='X|';
            nazgulCurrentPlayertmp--;
          };
          if (nazgulCurrentPlayertmp>0 && nazgulstep.value=='X|') {
            nazgulstep.value='X|X';
            nazgulCurrentPlayertmp--;
          }; 
        };  
      }.bind(this), 700); 

      // dodajemy nazgule dla przeciwników
      var activeBoardTmp = this.activeBoard;      
      var playerlp=0;
      var nazgulOtherPlayerstmp=JSON.parse(JSON.stringify(nazgulOtherPlayers));

      if(nazgulOtherPlayerstmp && nazgulOtherPlayerstmp.length){
        setTimeout(nazgulother.bind(this), 2500);
        function nazgulother() {
          var plno=nazgulOtherPlayerstmp.shift()
          this.activeBoard=plno;
          console.log("time: "+plno);
          var nazgulOtherPlayertmp=1;
          setTimeout(function(){
            for (nazgulstep of this.boards[this.activeBoard].nazgulspath) {
                if (nazgulOtherPlayertmp>0 && nazgulstep.value=='') {
                  nazgulstep.value='X';
                  nazgulOtherPlayertmp--;
                }; 
                if (nazgulOtherPlayertmp>0 && nazgulstep.value=='|') {
                  nazgulstep.value='X|';
                  nazgulOtherPlayertmp--;
                };
                if (nazgulOtherPlayertmp>0 && nazgulstep.value=='X|') {
                  nazgulstep.value='X|X';
                  nazgulOtherPlayertmp--;
                }; 
            };}.bind(this),700);
          if (nazgulOtherPlayerstmp && nazgulOtherPlayerstmp.length) {
            setTimeout(nazgulother.bind(this), 2500);
          };
        };
      };   

      //przełączamy planszę na następnego gracza
      console.log("otherPlayers.length:"+otherPlayers.length)
      if (otherPlayers.length) {        
        do {
          activeBoardTmp=(activeBoardTmp+1)%4;
        } while (!otherPlayers.includes(activeBoardTmp));
        setTimeout(function(){
          console.log("następny gracz - "+nazgulOtherPlayers.length)
          this.activeBoard=activeBoardTmp;
          this.nextPlayer=Date.now();
          
        }.bind(this), 2500+nazgulOtherPlayers.length*2500);
      }

    },
    scaleDown: function () {
      this.w=this.w-20;
      this.setCookie('boardw', JSON.stringify(this.w), 180);
    },
    scaleUp: function () {
      this.w=this.w+20;
      this.setCookie('boardw', JSON.stringify(this.w), 180);
    },
    setCookieMsg: function () {
      this.setCookie('boardcookiemsg', 'Ta aplikacja zapisuje ciasteczka (cookies) w  Twojej przeglądarce, żeby zachować swoje ustawienia.', 180);
      this.czyCookieMsg = false;
    },
  },
  computed: {
    cookiemsgclass: function () {
      if (this.getCookie('boardcookiemsg')) {
        this.czyCookieMsg = false; //false
      } else {
        this.czyCookieMsg = true; //true
      }
    },
    activeOtherPlayers: function () {
      var aop = [];
      for (b of this.boards) {
        if(b.nazgulstoend!=0 && b.id!=this.activeBoard) {aop.push(b.id)}
      }
      return aop;
    }
  },
  // props: {
    // ocena: Object,
    // oceny: Array,
    // rodzaj: String
  // },
  // created() {},
  mounted() { 
    var w = this.getCookie('boardw');
    if (w) {
      //this.w = JSON.parse(w);
    } else {
      //this.w = 600;
    }
    if (this.getCookie('boardcookiemsg')) {
      this.czyCookieMsg = false;
    } else {
      this.czyCookieMsg = true;
    };
    
   },
  // beforeCreate() { },
  // beforeMount() { },
  // beforeUpdate() { },
  // updated() { },
  // beforeDestroy() { },
  // destroyed() { }
})

let app = new Vue({
  el: '#app'
})
