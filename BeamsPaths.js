import { Beam } from './Beam.js'

export function loadBeams()

                                 //  ________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
                                 //  | С-Диапазон            :                       :        :       | Ku-Диапазон               :                           :                        :                        | Ka-Диапазон            | Зоны покрытыия спутников :                       :                       |
                                 //  | Фиксированные         :                       | Перенацел...   | Фиксированные             :                           | Перенацеливаемые       :                        | Фиксированные          | C                        | Ku                    | Ka                    |         
/* Спутник */                    //  | ФK-2                  | ФК-1                  | ФК-2   | ФК-1  | ФК-2                      | ФК-1                      | Л-1                    | Л-2                    | FK-1                   |                          |                       |                       |
{                                //  |_______________________|_______________________|________|_______|___________________________|___________________________|________________________|________________________|________________________|__________________________|_______________________|_______________________|
/* АМУ1 */  this.beams.push (new Beam ("none"                , "none"                , "none" , "none", "./beams/AMU1_afr.png"    , "./beams/AMU1_rus.png"    , "none"                 , "none"                 , "./beams/AMU1_ka.png"  , "none"                   , "./bands/AMU1-Ku.png" , "./bands/AMU1-Ka.png" ));  
/* АМ7  */  this.beams.push (new Beam ("./beams/AM7_FC.png"  , "./beams/AM7_SC.png"  , "none" , "none", "./beams/AM7_FK1.png"     , "./beams/AM7_FK2.png"     , "./beams/AM7_FK3.png"  , "./beams/AM7_SK.png"   , "none"                 , "./bands/AM7-C.png"      , "./bands/AM7-Ku.png"  , "none"                ));
/* АМ6  */  this.beams.push (new Beam ("./beams/AM6_FC1.png" , "./beams/AM6_FC2.png" , "none" , "none", "./beams/AM6_FK1.png"     , "./beams/AM6_FK2.png"     , "./beams/AM6_STK1.png" , "./beams/AM6_STK2.png" , "./beams/AM6_KaMB.png" , "./bands/AM6-C.png"      , "./bands/AM6-Ku.png"  , "none"                ));
/* АТ1  */  this.beams.push (new Beam ("none"                , "none"                , "none" , "none", "./beams/AT1_FK-east.png" , "./beams/AT1_FK-wide.png" , "none"                 , "none"                 , "none"                 , "none"                   , "./bands/AT1-Ku.png"  , "none"                ));
/* АМ33 */  this.beams.push (new Beam ("./beams/AM33_S1.png" , "none"                , "none" , "none", "./beams/AM33_ST1.png"    , "./beams/AM33_ST2.png"    , "none"                 , "none"                 , "none"                 , "./bands/AM33-C.png"     , "none"                , "none"                ));
/* АМ3  */  this.beams.push (new Beam ("./beams/AM3_FC.png"  , "./beams/AM3_SC.png"  , "none" , "none", "./beams/AM3_FK.png"      , "./beams/AM3_SK.png"      , "none"                 , "none"                 , "none"                 , "./bands/AM3-C copy.png" , "./bands/AM3-Ku.png"  , "none"                ));
/* АМ5  */  this.beams.push (new Beam ("./beams/AM5_FC.png"  , "./beams/AM5_SC.png"  , "none" , "none", "./beams/AM5_FK1.png"     , "./beams/AM5_FK2.png"     , "none"                 , "none"                 , "none"                 , "./bands/AM5-C.png"      , "./bands/AM5-Ku.png"  , "./bands/AM5-Ka.png"  ));
/* АТ2  */  this.beams.push (new Beam ("none"                , "none"                , "none" , "none", "./beams/AT2_FK-west.png" , "none"                    , "none"                 , "none"                 , "none"                 , "none"                   , "./bands/AT2-Ku.png"  , "none"                ));
/* АМ8  */  this.beams.push (new Beam ("./beams/AM8_FC1.png" , "./beams/AM8_FC2.png" , "none" , "none", "./beams/AM8_FK1.png"     , "./beams/AM8_FK2.png"     , "./beams/AM8_FK3.png"  , "none"                 , "none"                 , "none"                   , "./bands/AM8-Ku.png"  , "none"                ));
/* АМ44 */  this.beams.push (new Beam ("./beams/AM44_S1.png" , "none"                , "none" , "none", "./beams/AM44_ST1.png"    , "./beams/AM44_ST2.png"    , "none"                 , "none"                 , "none"                 , "./bands/AM44-C.png"     , "./bands/AM44-Ku.png" , "none"                ));
/* RV   */  this.beams.push (new Beam ("none"                , "none"                , "none" , "none", "./beams/RV-Ku_main.png"  , "./beams/RV-Ku_sec.png"   , "none"                 , "none"                 , "none"                 , "none"                   , "./bands/RV-Ku.png"   , "none"                ));

    for (let i = 0; i < 11; i++)
    {
        this.beams[i].addToScene (this.scene);
    }
}
