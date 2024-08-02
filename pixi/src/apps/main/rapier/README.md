
# Notes

1. Collider Translation является offset от RB Center of Mass
1. RB Rotation в случае наличия Translation у Collider делается из центра RB
1. Cl Rotation выставляется по центру
1. RB Center of Mass выставляется как середина между всеми Collider
1. При наличии RB Rotation Cl Translation меняется ТОЛЬКО если у Collider был Translation
1. RB не имеет формы
1. RB не имеет vertices, только Cl
1. У RB есть nextTranslation и nextRotation, а у Cl нет
1. У Cl есть castRay, а у RB нет
1. ...
1. ...