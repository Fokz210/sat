// IMPORTS
import 
{
	Mesh,
    LinearFilter,
    MeshBasicMaterial,
    SphereBufferGeometry,
    TextureLoader
} from './three.js-master/build/three.module.js';

export class Beam
{
    constructor (Cfixed1, Cfixed2, Creaim1, Creaim2, KUfixed1, KUfixed2, KUfixed3, KUreaim1, KUreaim2, KAreaim, C, Ku, Ka)
    {
        this.tLoader = new TextureLoader ();

        // BEAMS

        if (Cfixed1 != "none")
        {
            var cf1 = this.tLoader.load (Cfixed1);
            cf1.minFilter = LinearFilter;
            var mcf1 = new MeshBasicMaterial ({ transparent: true, map: cf1 });
            this.CFixed1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcf1);
        }

        if (Cfixed2 != "none")
        {  
            var cf2 = this.tLoader.load (Cfixed2);
            cf2.minFilter = LinearFilter;
            var mcf2 = new MeshBasicMaterial ({ transparent: true, map: cf2 });
            this.CFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcf2);
        }

        if (Creaim1 != "none")
        {  
            var cr1 = this.tLoader.load (Creaim1);
            cr1.minFilter = LinearFilter;
            var mcr1 = new MeshBasicMaterial ({ transparent: true, map: cr1 });
            this.CReaim1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcr1);
        }

        if (Creaim2 != "none")
        {
            var cr2 = this.tLoader.load (Creaim2);
            cr2.minFilter = LinearFilter;
            var mcr2 = new MeshBasicMaterial ({ transparent: true, map: cr2 });
            this.CReaim2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mcr2);
        }

        if (KUfixed1 != "none")
        {
            var kuf1 = this.tLoader.load (KUfixed1);
            kuf1.minFilter = LinearFilter;
            var mkuf1 = new MeshBasicMaterial ({ transparent: true, map: kuf1 });
            this.KUFixed1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkuf1);
        }

        if (KUfixed2 != "none")
        {
            var kuf2 = this.tLoader.load (KUfixed2);
            kuf2.minFilter = LinearFilter;
            var mkuf2 = new MeshBasicMaterial ({ transparent: true, map: kuf2 });
            this.KUFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkuf2);
        }

        if (KUfixed3 != "none")
        {
            var kuf3 = this.tLoader.load (KUfixed3);
            kuf3.minFilter = LinearFilter;
            var mkuf3 = new MeshBasicMaterial ({ transparent: true, map: kuf3 });
            this.KUFixed3 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkuf3);
        }

        if (KUreaim1 != "none")
        {
            var kur1 = this.tLoader.load (KUreaim1);
            kur1.minFilter = LinearFilter;
            var mkur1 = new MeshBasicMaterial ({ transparent: true, map: kur1 });
            this.KUreaim1 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkur1);
        }


        if (KUreaim2 != "none")
        {
            var kur2 = this.tLoader.load (KUreaim2);
            kur2.minFilter = LinearFilter;
            var mkur2 = new MeshBasicMaterial ({ transparent: true, map: kur2 });
            this.KUFixed2 = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mkur2);
        }


        if (KAreaim != "none")
        {
            var ka = this.tLoader.load (KAreaim);
            ka.minFilter = LinearFilter;
            var mka = new MeshBasicMaterial ({ transparent: true, map: ka });
            this.KAReaim = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mka);
        }

        // RANGES

        if (C != "none")
        {
            var c = this.tLoader.load (C);
            c.minFilter = LinearFilter;
            var mc = new MeshBasicMaterial ({ transparent: true, map: c });
            this.c = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mc);
        }

        if (Ku != "none")
        {
            var ku = this.tLoader.load (Ku);
            ku.minFilter = LinearFilter;
            var mku = new MeshBasicMaterial ({ transparent: true, map: ku });
            this.Ku = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mku);
        }

        if (Ka != "none")
        {
            var ka = this.tLoader.load (Ka);
            ka.minFilter = LinearFilter;
            var mka = new MeshBasicMaterial ({ transparent: true, map: ka }); 
            this.Ka = new Mesh (new SphereBufferGeometry (10.1, 64, 64), mka);
        }

        this.CFixed1n = "";
        this.CFixed2n = "";
        this.CReaim1n = "";
        this.CReaim2n = "";
        this.KUFixed1n = "";
        this.KUFixed2n = "";
        this.KUFixed3n = "";
        this.KUReaim1n = "";
        this.KUReaim2n = "";
        this.KAReaimn = "";
    }

    addToScene (scene)
    {
        this.setVisible (false);

        var add  = function (mesh, scene2)
        {
            if (mesh != undefined)
                scene2.add (mesh);
        }

        add (this.CFixed1, scene);
        add (this.CFixed2, scene);
        add (this.CReaim1, scene);
        add (this.CReaim2, scene);
        add (this.KUFixed1, scene);
        add (this.KUFixed2, scene);
        add (this.KUReaim1, scene);
        add (this.KUReaim2, scene);
        add (this.KAReaim,  scene);

        add (this.c, scene);
        add (this.Ku, scene);
        add (this.Ka, scene);
    }

    setVisible (state)
    {
        var setVisibility = function (mesh, state)
        {
            if (mesh != undefined)
                mesh.visible = state;
        }

        setVisibility (this.CFixed1, state);
        setVisibility (this.CFixed2, state);
        setVisibility (this.CReaim1, state);
        setVisibility (this.CReaim2, state);
        setVisibility (this.KUFixed1, state);
        setVisibility (this.KUFixed2, state);
        setVisibility (this.KUreaim1, state);
        setVisibility (this.KUreaim2, state);
        setVisibility (this.KAReaim, state);

        setVisibility (this.c, state);
        setVisibility (this.Ku, state);
        setVisibility (this.Ka, state);
    }
}
