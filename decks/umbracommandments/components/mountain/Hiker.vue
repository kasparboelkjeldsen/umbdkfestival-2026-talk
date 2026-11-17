<script setup>
// The hiker on Mount Bellissima, holding the tablets up (an SVG <g> in the revelation's 1920 × 1080
// px). He stands IN the painted picture (paint.js): 4.2 m from its camera, feet on the meadow at
// (1035, 1000), 333 px to the metre, and the painting casts his shadow. His palms sit under the
// bottom corners of the tablets card (world.js TABLETS_SLOT), thumbs up its sides: the real
// tablets are what he's holding. Grey beard, laughing, red plaid, a pack with a bedroll.
//
// Vector, because the camera goes right up to his face (the tiny-text zoom). Every part is a flat
// palette colour (the revelation's --skin, --shirt, …, so dusk and night fall on him too) under a
// shared "volume" gradient: shade on the left of each form, light on its right, where the sun is.
const id = 'hk'
// the right arm is the left one mirrored about the middle of the two tablets
const MIRROR = 'translate(2076 0) scale(-1 1)'

const P = {
  legL: 'M988 744L1038 744C1038 792 1032 838 1025 880C1021 910 1016 938 1014 962L980 962C979 934 981 906 984 878C985 832 985 788 988 744Z',
  legR: 'M1034 744L1084 744C1090 790 1095 834 1096 878C1098 906 1100 934 1100 960L1066 960C1064 934 1061 908 1058 880C1052 838 1042 794 1034 744Z',
  bootL: 'M978 954L1016 954C1017 968 1022 978 1023 988L1023 994L969 994L969 988C970 978 976 968 978 954Z',
  bootR: 'M1064 952L1102 952C1103 966 1108 976 1109 986L1109 992L1055 992L1055 986C1056 976 1062 966 1064 952Z',
  pack: 'M958 568C958 552 970 544 988 544H1082C1100 544 1112 552 1112 568V706C1112 720 1102 728 1088 728H982C968 728 958 720 958 706Z',
  roll: 'M962 523C962 513 970 506 980 506H1090C1100 506 1108 513 1108 523C1108 533 1100 540 1090 540H980C970 540 962 533 962 523Z',
  torso: 'M972 550C984 538 1008 534 1035 536C1062 534 1086 538 1098 550C1101 602 1097 664 1091 744L979 744C973 664 969 602 972 550Z',
  sleeve: 'M996 544C975 524 946 496 920 468C908 462 894 474 892 488C916 516 944 546 968 572C980 566 990 556 996 544Z',
  cuff: 'M942 488L929 474L899 502L911 517Z',
  forearm: 'M890 474C896 446 908 418 922 392L947 399C938 426 928 456 921 486C912 496 894 490 890 474Z',
  palm: 'M912 388C911 380 917 376 926 376L950 376C959 376 962 384 957 391L948 402C940 408 926 408 919 402Z',
  thumb: 'M913 391C905 391 900 383 900 372C900 361 903 353 908 353C913 353 915 361 915 372Z',
  head: 'M1000 452C1000 420 1016 408 1035 408C1054 408 1070 420 1070 452L1070 478C1070 502 1056 514 1035 514C1014 514 1000 502 1000 478Z',
  hair: 'M997 460C990 426 1008 403 1035 402C1062 403 1080 426 1073 460C1070 442 1063 430 1052 425C1044 419 1026 419 1018 425C1007 430 1000 442 997 460Z',
  beard: 'M999 468C993 502 1002 538 1035 560C1068 538 1077 502 1071 468C1068 486 1060 498 1049 502Q1035 512 1021 502C1010 498 1002 486 999 468Z',
  tache: 'M1035 481C1026 474 1013 478 1007 489C1018 494 1030 491 1035 486C1040 491 1052 494 1063 489C1057 478 1044 474 1035 481Z',
}
</script>

<template>
  <g class="hiker">
    <defs>
      <!-- shade on the left of a form, light on its right (objectBoundingBox: one for every part) -->
      <linearGradient :id="`${id}-vol`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0b0a14" stop-opacity="0.42" />
        <stop offset="0.42" stop-color="#0b0a14" stop-opacity="0.08" />
        <stop offset="0.7" stop-color="#0b0a14" stop-opacity="0" />
        <stop offset="1" style="stop-color: var(--rim)" stop-opacity="0.3" />
      </linearGradient>
      <!-- the same, for the mirrored arm (mirroring turns the gradient round too) -->
      <linearGradient :id="`${id}-vol-m`" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stop-color="#0b0a14" stop-opacity="0.42" />
        <stop offset="0.42" stop-color="#0b0a14" stop-opacity="0.08" />
        <stop offset="0.7" stop-color="#0b0a14" stop-opacity="0" />
        <stop offset="1" style="stop-color: var(--rim)" stop-opacity="0.3" />
      </linearGradient>
      <!-- darker towards the ground: legs, pack -->
      <linearGradient :id="`${id}-fall`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0a14" stop-opacity="0" />
        <stop offset="1" stop-color="#0b0a14" stop-opacity="0.2" />
      </linearGradient>
      <pattern :id="`${id}-plaid`" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-3)">
        <rect width="26" height="26" style="fill: var(--shirt)" />
        <rect y="9" width="26" height="9" style="fill: var(--shirt-dark)" opacity="0.6" />
        <rect x="9" width="9" height="26" style="fill: var(--shirt-dark)" opacity="0.6" />
        <path d="M0 3.5h26M3.5 0v26" style="stroke: var(--shirt-light)" stroke-width="1.6" opacity="0.75" />
        <path d="M0 22.5h26M22.5 0v26" style="stroke: var(--shirt-dark)" stroke-width="1.2" opacity="0.5" />
      </pattern>
    </defs>

    <!-- where the boots meet the grass (the long shadow is in the painting) -->
    <ellipse cx="996" cy="1001" rx="40" ry="6.5" fill="#0c1a08" opacity="0.5" />
    <ellipse cx="1082" cy="999" rx="40" ry="6.5" fill="#0c1a08" opacity="0.5" />

    <!-- the pack and its bedroll, behind him -->
    <path :d="P.roll" style="fill: var(--roll)" /><path :d="P.roll" :fill="`url(#${id}-vol)`" />
    <path d="M988 506V540M1082 506V540" style="stroke: var(--strap)" stroke-width="6" />
    <path :d="P.pack" style="fill: var(--pack)" /><path :d="P.pack" :fill="`url(#${id}-vol)`" /><path :d="P.pack" :fill="`url(#${id}-fall)`" />
    <ellipse cx="958" cy="668" rx="9" ry="27" style="fill: var(--pack)" /><ellipse cx="958" cy="668" rx="9" ry="27" fill="#0b0a14" opacity="0.3" />
    <ellipse cx="1112" cy="668" rx="9" ry="27" style="fill: var(--pack)" /><ellipse cx="1113" cy="668" rx="5" ry="24" style="fill: var(--rim)" opacity="0.2" />

    <!-- legs -->
    <path :d="P.legL" style="fill: var(--pants)" /><path :d="P.legL" :fill="`url(#${id}-vol)`" /><path :d="P.legL" :fill="`url(#${id}-fall)`" />
    <!-- the right leg throws a little shade on the left one -->
    <path d="M1010 744L1038 744C1038 782 1034 822 1029 856C1024 822 1016 782 1010 744Z" fill="#0b0a14" opacity="0.26" />
    <path :d="P.legR" style="fill: var(--pants)" /><path :d="P.legR" :fill="`url(#${id}-vol)`" /><path :d="P.legR" :fill="`url(#${id}-fall)`" />
    <g fill="none" style="stroke: var(--pants-shade)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M990 872q15 9 32 0M994 884q12 5 24 0M1062 874q16 9 32 -1M1066 886q12 5 25 -1" />
      <path d="M1060 792h25l3 36h-24zM1061 800h25" />
      <path d="M1000 760q4 30 2 60M1048 762q10 40 14 80" opacity="0.5" />
      <path d="M980 950h34M1066 948h34" opacity="0.7" />
    </g>

    <!-- boots: leather, a toe cap, laces, a thick sole -->
    <path :d="P.bootL" style="fill: var(--boot)" /><path :d="P.bootL" :fill="`url(#${id}-vol)`" />
    <path :d="P.bootR" style="fill: var(--boot)" /><path :d="P.bootR" :fill="`url(#${id}-vol)`" />
    <path d="M972 983Q996 974 1021 983M1058 981Q1082 972 1107 981" fill="none" style="stroke: var(--boot-dark)" stroke-width="2.4" stroke-linecap="round" />
    <path d="M988 960h18M987 967h20M986 974h22M1074 958h18M1073 965h20M1072 972h22" style="stroke: var(--metal)" stroke-width="2" stroke-linecap="round" opacity="0.8" />
    <path d="M966 992H1026V998Q1026 1002 1021 1002H971Q966 1002 966 998Z" style="fill: var(--boot-dark)" />
    <path d="M1052 990H1112V996Q1112 1000 1107 1000H1057Q1052 1000 1052 996Z" style="fill: var(--boot-dark)" />

    <!-- the shirt -->
    <path :d="P.torso" :fill="`url(#${id}-plaid)`" /><path :d="P.torso" :fill="`url(#${id}-vol)`" />
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- folds under the arms, the placket and its buttons, two chest pockets -->
      <path d="M982 588q7 32 3 74M1088 588q-7 32 -3 74M1000 700q16 12 34 8M1070 700q-16 12 -34 8" stroke="#0b0a14" stroke-width="3" opacity="0.22" />
      <path d="M1031 556V744M1040 556V744" style="stroke: var(--shirt-dark)" stroke-width="2" opacity="0.6" />
      <path d="M991 612h28v24q-14 9 -28 0zM991 620h28M1051 612h28v24q-14 9 -28 0zM1051 620h28" style="stroke: var(--shirt-dark)" stroke-width="2.2" opacity="0.7" />
    </g>
    <g style="fill: var(--metal)"><circle cx="1035.5" cy="592" r="2.8" /><circle cx="1035.5" cy="630" r="2.8" /><circle cx="1035.5" cy="668" r="2.8" /><circle cx="1035.5" cy="706" r="2.8" /></g>

    <!-- the pack's straps, a chest strap, the belt -->
    <path d="M989 546C990 600 994 652 996 708M1081 546C1080 600 1076 652 1074 708" fill="none" style="stroke: var(--strap)" stroke-width="14" stroke-linecap="round" />
    <path d="M993 550C994 602 998 652 1000 704M1085 550C1084 602 1080 652 1078 704" fill="none" style="stroke: var(--rim)" stroke-width="2.4" stroke-linecap="round" opacity="0.3" />
    <path d="M996 646H1074" style="stroke: var(--strap)" stroke-width="7" />
    <rect x="1027" y="639" width="17" height="14" rx="2.5" style="fill: var(--metal)" /><rect x="1031" y="643" width="9" height="6" rx="1" style="fill: var(--strap)" />
    <rect x="979" y="736" width="112" height="14" rx="2" style="fill: var(--belt)" />
    <rect x="1026" y="734" width="19" height="18" rx="3" fill="none" style="stroke: var(--metal)" stroke-width="3.4" />
    <path d="M1000 734v18M1070 734v18" style="stroke: var(--pants-shade)" stroke-width="5" />

    <!-- arms, raised: plaid sleeves rolled to the elbow, bare forearms, the tablets in his palms -->
    <g v-for="side in ['l', 'r']" :key="side" :transform="side === 'r' ? MIRROR : null">
      <path :d="P.forearm" style="fill: var(--skin)" /><path :d="P.forearm" :fill="`url(#${id}-vol${side === 'r' ? '-m' : ''})`" />
      <path d="M902 478q8 -34 24 -70" fill="none" style="stroke: var(--skin-shade)" stroke-width="2.4" stroke-linecap="round" opacity="0.6" />
      <path :d="P.sleeve" :fill="`url(#${id}-plaid)`" /><path :d="P.sleeve" :fill="`url(#${id}-vol${side === 'r' ? '-m' : ''})`" />
      <path d="M966 566q-8 -16 -4 -30M950 548q-6 -12 -2 -24" fill="none" stroke="#0b0a14" stroke-width="3" stroke-linecap="round" opacity="0.2" />
      <path :d="P.cuff" style="fill: var(--shirt-dark)" /><path :d="P.cuff" fill="none" style="stroke: var(--shirt-light)" stroke-width="1.8" stroke-linejoin="round" opacity="0.7" />
      <path :d="P.thumb" style="fill: var(--skin)" /><path :d="P.thumb" :fill="`url(#${id}-vol${side === 'r' ? '-m' : ''})`" />
      <path :d="P.palm" style="fill: var(--skin)" /><path :d="P.palm" :fill="`url(#${id}-vol${side === 'r' ? '-m' : ''})`" />
      <path d="M918 398q16 8 32 0" fill="none" style="stroke: var(--skin-shade)" stroke-width="2.2" stroke-linecap="round" />
    </g>

    <!-- the head -->
    <ellipse cx="998" cy="464" rx="8" ry="13" style="fill: var(--skin-shade)" />
    <ellipse cx="1072" cy="464" rx="8" ry="13" style="fill: var(--skin)" /><path d="M1071 456q5 8 0 16" fill="none" style="stroke: var(--skin-shade)" stroke-width="2" stroke-linecap="round" />
    <path :d="P.head" style="fill: var(--skin)" /><path :d="P.head" :fill="`url(#${id}-vol)`" />
    <!-- the beard, full and white, with its own shade -->
    <path :d="P.beard" style="fill: var(--beard)" /><path :d="P.beard" :fill="`url(#${id}-vol)`" />
    <path d="M1008 504q6 24 20 40M1020 510q4 24 12 42M1050 510q-4 24 -12 42M1062 504q-6 24 -20 40M1003 486q2 20 10 34M1067 486q-2 20 -10 34M1035 514v40" fill="none" style="stroke: var(--beard-shade)" stroke-width="2" stroke-linecap="round" opacity="0.8" />
    <!-- hair, swept back off a high forehead -->
    <path :d="P.hair" style="fill: var(--hair)" /><path :d="P.hair" :fill="`url(#${id}-vol)`" />
    <path d="M1010 420q12 -11 30 -9M1020 412q14 -6 30 -2M1052 418q12 6 16 22" fill="none" style="stroke: var(--beard)" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
    <!-- brows up, eyes squeezed shut with joy, crow's feet -->
    <path d="M1009 445q10 -9 20 -3M1041 442q10 -6 20 3" fill="none" style="stroke: var(--beard)" stroke-width="5.5" stroke-linecap="round" />
    <path d="M1009 445q10 -9 20 -3M1041 442q10 -6 20 3" fill="none" style="stroke: var(--beard-shade)" stroke-width="1.6" stroke-linecap="round" opacity="0.7" />
    <path d="M1011 458q8 -8 17 0M1042 458q9 -8 17 0" fill="none" style="stroke: var(--ink)" stroke-width="3.2" stroke-linecap="round" />
    <path d="M1006 455l-5 -3M1006 460l-6 1M1064 455l5 -3M1064 460l6 1" fill="none" style="stroke: var(--skin-shade)" stroke-width="1.8" stroke-linecap="round" />
    <path d="M1018 428q17 -5 34 0M1022 434q13 -3 26 0" fill="none" style="stroke: var(--skin-shade)" stroke-width="1.6" stroke-linecap="round" opacity="0.6" />
    <!-- cheeks, nose -->
    <ellipse cx="1014" cy="473" rx="9" ry="6" style="fill: var(--blush)" opacity="0.4" /><ellipse cx="1057" cy="473" rx="9" ry="6" style="fill: var(--blush)" opacity="0.45" />
    <path d="M1035 452C1031 462 1027 470 1029 475C1032 480 1039 480 1042 475C1044 470 1039 462 1037 452Z" style="fill: var(--skin-shade)" opacity="0.75" />
    <ellipse cx="1038" cy="472" rx="3" ry="4" style="fill: var(--rim)" opacity="0.45" />
    <!-- a laugh under the moustache -->
    <path d="M1020 489Q1035 512 1050 489Z" style="fill: var(--mouth)" />
    <path d="M1023 489Q1035 495 1047 489L1046 493Q1035 499 1024 493Z" style="fill: var(--teeth)" />
    <path d="M1028 501q7 -4 14 0q-7 6 -14 0z" style="fill: var(--blush)" />
    <path :d="P.tache" style="fill: var(--beard)" /><path :d="P.tache" :fill="`url(#${id}-vol)`" />
    <path d="M1007 489C1018 494 1030 491 1035 486C1040 491 1052 494 1063 489" fill="none" style="stroke: var(--beard-shade)" stroke-width="1.8" stroke-linecap="round" />

    <!-- the sun on his right edge -->
    <g fill="none" style="stroke: var(--rim)" stroke-linecap="round" stroke-width="3" opacity="0.75">
      <path d="M1064 414q10 14 9 40M1098 556q2 60 -4 150M1092 760q5 60 5 118M1101 892q2 34 1 62" />
      <path d="M1070 478q2 34 -14 62" opacity="0.6" />
    </g>
  </g>
</template>
