class TableauTiledRenew extends Tableau{
    /**
     * Ce tableau démontre comment se servir de Tiled, un petit logiciel qui permet de designer des levels et de les importer dans Phaser (entre autre).
     *
     * Ce qui suit est très fortement inspiré de ce tuto :
     * https://stackabuse.com/phaser-3-and-tiled-building-a-platformer/
     *
     * Je vous conseille aussi ce tuto qui propose quelques alternatives (la manière dont son découpées certaines maisons notamment) :
     * https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
     */
    preload() {
        super.preload();
        // ------pour TILED-------------
        // nos images
        this.load.image('tiles', 'assets/tilesets/platformPack_tilesheet.png');
        //les données du tableau qu'on a créé dans TILED
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/level1_V002.json');

        // ---------Les monstres------------
        this.load.image('monster-fly', 'assets/monster-dragon.png');
        this.load.image('monster-katana', 'assets/monster_katana.png');
        this.load.image('tireur', 'assets/tireur.png');
        this.load.image('projo', 'assets/projo.png');

        // ---------Les étoiles-----------
        this.load.image('stars', 'assets/soleil.png');

        // -----et puis aussi-------------

        this.load.image('night', 'assets/images/background.png');
        //atlas de texture généré avec https://free-tex-packer.com/app/
        //on y trouve notre étoiles et une tête de mort


    }


    create() {
        super.create();


        this.projo1=this.physics.add.sprite(200,400,"projo");
        this.projo1.setCollideWorldBounds(true);
        this.projo1.setBounce(0);
        this.projo1.body.allowGravity=false;
        this.projo1.setVelocityX(100);
        this.projo1.setDepth(1000);
        this.projo1.body.setSize(35,50);
        this.physics.add.overlap(this.player, this.projo1, this.hitMonster, null, this);
        //on en aura besoin...
        //let ici=this;

        //--------chargement de la tile map & configuration de la scène-----------------------

        //notre map
        this.map = this.make.tilemap({ key: 'map' });
        //nos images qui vont avec la map
        this.tileset = this.map.addTilesetImage('kenny_simple_platformer', 'tiles');

        //on agrandit le champ de la caméra du coup
        let largeurDuTableau=this.map.widthInPixels;
        let hauteurDuTableau=this.map.heightInPixels;
        this.physics.world.setBounds(0, 0, largeurDuTableau,  hauteurDuTableau);
        this.cameras.main.setBounds(0, 0, largeurDuTableau, hauteurDuTableau);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.2);

        //---- ajoute les plateformes simples ----------------------------

        // this.solides = this.map.createLayer('solides', this.tileset, 0, 0);
        // this.lave = this.map.createLayer('lave', this.tileset, 0, 0);
        this.derriere = this.map.createLayer('derriere', this.tileset, 0, 0);
        this.devant = this.map.createLayer('Platforms', this.tileset, 0, 0);


        //on définit les collisions, plusieurs méthodes existent:

        // 1 La méthode que je préconise (il faut définir une propriété dans tiled pour que ça marche)
        //permet de travailler sur un seul layer dans tiled et des définir les collisions en fonction des graphiques
        //exemple ici https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
        this.devant.setCollisionByProperty({ collides: true }); //sert aussi pour déterminer quelle tuile joue quel son quand on marche dessus par ex a voir comment ça marche vraiment par contre
        //this.lave.setCollisionByProperty({ collides: true });

        // 2 manière la plus simple (là où il y a des tiles ça collide et sinon non)
        //this.devant.setCollisionByExclusion(-1, true);
        //this.lave.setCollisionByExclusion(-1, true);

        // 3 Permet d'utiliser l'éditeur de collision de Tiled...mais ne semble pas marcher pas avec le moteur de physique ARCADE, donc oubliez cette option :(
        //this.map.setCollisionFromCollisionGroup(true,true,this.plateformesSimples);

        //----------les étoiles (objets) ---------------------

        // c'est un peu plus compliqué, mais ça permet de maîtriser plus de choses...
        this.stars = this.physics.add.group({
            allowGravity: true,
            immovable: false,
            bounceY:0,
            bounceX:1,
        });
        this.starsObjects = this.map.getObjectLayer('stars')['objects'];
        // On crée des étoiles pour chaque objet rencontré
        this.starsObjects.forEach(starObject => {
            // Pour chaque étoile on la positionne pour que ça colle bien car les étoiles ne font pas 64x64
            let star = this.stars.create(starObject.x+32, starObject.y+32 , 'particles', 'star');
        });





        //----------les monstres volants (objets tiled) ---------------------

        let monstersContainer=this.add.container();
        let ici=this;//pour faire collider les monstres
        this.flyingMonstersObjects = this.map.getObjectLayer('flyingMonsters')['objects'];
        // On crée des monstres volants pour chaque objet rencontré

        this.flyingMonstersObjects.forEach(monsterObject => {
            let monster=new MonsterFly(this,monsterObject.x,monsterObject.y); //ici, on appelle le nom de la classe
            monstersContainer.add(monster);
        });

        //----------les monstres terrestres (objets tiled) ---------------------

        ici.katanaMonstersObjects = ici.map.getObjectLayer('katanaMonsters')['objects']; //katanaMonsters est le nom du calque objet dans tiled
        ici.katanaMonstersObjects.forEach(monsterObject => {
            let monster=new MonsterOrange(this,monsterObject.x,monsterObject.y); //ici, on appelle le nom de la classe
            //let ici déclare la variable monster en local donc n'existe pas en dehors de cette fonction
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.devant);
        });

        ici.tireurMonstersObjects = ici.map.getObjectLayer('tireurMonsters')['objects']; //katanaMonsters est le nom du calque objet dans tiled
        ici.tireurMonstersObjects.forEach(monsterObject => {
            let monster=new Tireur(this,monsterObject.x,monsterObject.y); //ici, on appelle le nom de la classe
            let projo=new Projectile(this,monsterObject.x,monsterObject.y);
            //let ici déclare la variable monster en local donc n'existe pas en dehors de cette fonction
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.devant);
        });

        ici.PlateformMouvObjects = ici.map.getObjectLayer('PlateformMouv')['objects']; //katanaMonsters est le nom du calque objet dans tiled
        ici.PlateformMouvObjects.forEach(monsterObject => {
            let monster=new PlateformMouv(this,monsterObject.x,monsterObject.y); //ici, on appelle le nom de la classe

            //let ici déclare la variable monster en local donc n'existe pas en dehors de cette fonction
            monstersContainer.add(monster);
            this.physics.add.collider(monster, this.player);
        });



        //Checkpoints
        this.checkPoints = this.physics.add.staticGroup();
        this.checkPointsObjects = this.map.getObjectLayer('checkPoints')['objects'];
        //on crée des checkpoints pour chaque objet rencontré
        this.checkPointsObjects.forEach(checkPointObject => {
            let point=this.checkPoints.create(checkPointObject.x,checkPointObject.y/*,"particles","death-white"*/).setOrigin(0.5,1);
            point.blendMode=Phaser.BlendModes.COLOR_DODGE;
            point.checkPointObject=checkPointObject;
        });



        //----------les monstres terrestres (objets tiled) ---------------------
        /*this.katanaMonstersObjects = this.map.getObjectLayer('katanaMonsters')['objects'];
        this.katanaMonstersObjects.forEach(monsterObject => {
            let monster=new MonsterOrange(this,monsterObject.x,monsterObject.y); //ici, on appelle le nom de la classe
            monstersContainer.add(monster);
        });*/


        //----------débug---------------------

        //pour débugger les collisions sur chaque layer
        let debug=this.add.graphics().setAlpha(this.game.config.physics.arcade.debug?0.75:0);
        if(this.game.config.physics.arcade.debug === false){
            debug.visible=false;
        }
        // //débug solides en vers
        // this.solides.renderDebug(debug,{
        //     tileColor: null, // Couleur des tiles qui ne collident pas
        //     collidingTileColor: new Phaser.Display.Color(0, 255, 0, 255), //Couleur des tiles qui collident
        //     faceColor: null // Color of colliding face edges
        // });
        // //debug lave en rouge
        // this.lave.renderDebug(debug,{
        //     tileColor: null, // Couleur des tiles qui ne collident pas
        //     collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255), //Couleur des tiles qui collident
        //     faceColor: null // Color of colliding face edges
        // });


        //---------- parallax ciel (rien de nouveau) -------------

        //on change de ciel, on fait une tileSprite ce qui permet d'avoir une image qui se répète
        this.sky=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'night'
        );
        this.sky2=this.add.tileSprite(
            0,
            0,
            this.sys.canvas.width,
            this.sys.canvas.height,
            'night'
        );
        this.sky.setOrigin(0,0);
        this.sky2.setOrigin(0,0);
        this.sky.setScrollFactor(0);//fait en sorte que le ciel ne suive pas la caméra
        this.sky2.setScrollFactor(0);//fait en sorte que le ciel ne suive pas la caméra
        this.sky2.blendMode=Phaser.BlendModes.ADD;

        //----------collisions---------------------

        //quoi collide avec quoi?
        this.physics.add.collider(this.player, this.devant);


        this.physics.add.collider(this.stars, this.devant);
        //this.physics.add.collider(this.katanaMonstersObjects, this.devant);
        //si le joueur touche une étoile dans le groupe...
        //this.physics.add.overlap(this.player, this.stars, this.ramasserEtoile, null, this);
        this.physics.add.collider(this.stars, this.player);
        //quand on touche la lave, on meurt
        this.physics.add.collider(this.player, this.lave,this.playerDie,null,this);

        //quand on touche un checkpoint
        this.physics.add.overlap(this.player, this.checkPoints, function(player, checkPoint)
         {
             ici.saveCheckPoint(checkPoint.checkPointObject.name);
         }, null, this);


        //--------- Z order -----------------------

        //on définit les z à la fin
        let z=1000; //niveau Z qui a chaque fois est décrémenté.
        this.checkPoints.setDepth(1000);
        debug.setDepth(z--);
        //this.blood.setDepth(z--);

        monstersContainer.setDepth(z--);
        this.stars.setDepth(z--);
        //starsFxContainer.setDepth(z--);

        this.devant.setDepth(z--);
        // this.solides.setDepth(z--);
        // this.laveFxContainer.setDepth(z--);
        // this.lave.setDepth(z--);
        this.player.setDepth(z--);
        this.derriere.setDepth(z--);
        // this.sky2.setDepth(z--);
        this.sky.setDepth(z--);

        this.restoreCheckPoint();





    }

    //Checkpoint
    saveCheckPoint(checkPointName){
        if (localStorage.getItem("checkPoint") !== checkPointName){
            console.log("on atteint le checkpoint", checkPointName);
            localStorage.setItem("checkPoint", checkPointName);
        }
    }
    restoreCheckPoint(){
        let storedCheckPoint=localStorage.getItem("checkPoint")
        if(storedCheckPoint){
            this.checkPointsObjects.forEach(checkPointObject => {
                if(checkPointObject.name === storedCheckPoint){
                    this.player.setPosition(checkPointObject.x, checkPointObject.y-64*2);
                    //console.log("on charge le checkpoint", checkPointName);
                }
            });
        }
    }

    /**
     * Permet d'activer, désactiver des éléments en fonction de leur visibilité dans l'écran ou non
     */
    optimizeDisplay(){
        //return;
        let world=this.cameras.main.worldView; // le rectangle de la caméra, (les coordonnées de la zone visible)

        //     // on va activer / désactiver les particules de lave
        //     for( let particule of this.laveFxContainer.getAll()){ // parcours toutes les particules de lave
        //         if(Phaser.Geom.Rectangle.Overlaps(world,particule.rectangle)){
        //             //si le rectangle de la particule est dans le rectangle de la caméra
        //             if(!particule.visible){
        //                 //on active les particules
        //                 particule.resume();
        //                 particule.visible=true;
        //             }
        //         }else{
        //             //si le rectangle de la particule n'est PAS dans le rectangle de la caméra
        //             if(particule.visible){
        //                 //on désactive les particules
        //                 particule.pause();
        //                 particule.visible=false;
        //             }
        //         }
        //     }
        //
        //     // ici vous pouvez appliquer le même principe pour des monstres, des étoiles etc...
    }




    /**
     * Fait se déplacer certains éléments en parallax
     */
    moveParallax(){
        //le ciel se déplace moins vite que la caméra pour donner un effet paralax
        this.sky.tilePositionX=this.cameras.main.scrollX*0.6;
        this.sky.tilePositionY=this.cameras.main.scrollY*0.6;
        this.sky2.tilePositionX=this.cameras.main.scrollX*0.7+100;
        this.sky2.tilePositionY=this.cameras.main.scrollY*0.7+100;
    }








    update(){
        super.update();
        this.moveParallax();

        //optimisation
        //teste si la caméra a bougé
        let actualPosition=JSON.stringify(this.cameras.main.worldView);
        if(
            !this.previousPosition
            || this.previousPosition !== actualPosition
        ){
            this.previousPosition=actualPosition;
            this.optimizeDisplay();
        }


    }




}