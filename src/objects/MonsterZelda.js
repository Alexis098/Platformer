class MonsterZelda extends ObjetEnnemi{
    /**
     *
     * @param {Tableau} scene
     * @param x
     * @param y
     */
    constructor(scene, x, y) {
        super(scene, x, y, "monster-zelda");
    
        
        //this.setBodySize(this.body.width,this.body.height);
        this.body.setSize(1100,1100);
        this.setOffset(0, 30);
        this.setOrigin(0,0);
        this.setDisplaySize(64,64);
        this.setCollideWorldBounds(true);
        this.setBounce(1);
        this.setVelocityX(40);
        this.setDepth(10);
        //this.physics.add.overlap(this.player, this.monstre, this.hitSpike, null, this);
    
    }

}