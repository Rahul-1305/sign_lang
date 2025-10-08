import cv2
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import os as oss
import traceback

# --- Make data paths robust: prefer the original absolute path if present,
# otherwise fall back to a project-local AtoZ_3.1 / AtoZ_3.2 folders.
# This prevents FileNotFoundError when running on machines that don't have
# the original dataset path.
THIS_DIR = oss.path.dirname(__file__)
DEFAULT_DATA_ROOT = r"D:\ASL\Sign-Language-To-Text-and-Speech-Conversion\AtoZ_3.1"
DEFAULT_SAVE_ROOT = r"D:\ASL\Sign-Language-To-Text-and-Speech-Conversion\AtoZ_3.2"

if oss.path.exists(DEFAULT_DATA_ROOT):
    DATA_ROOT = DEFAULT_DATA_ROOT
else:
    DATA_ROOT = oss.path.join(THIS_DIR, "AtoZ_3.1")
    # make sure the fallback folder exists
    oss.makedirs(DATA_ROOT, exist_ok=True)

if oss.path.exists(DEFAULT_SAVE_ROOT):
    SAVE_ROOT = DEFAULT_SAVE_ROOT
else:
    SAVE_ROOT = oss.path.join(THIS_DIR, "AtoZ_3.2")
    oss.makedirs(SAVE_ROOT, exist_ok=True)



capture = cv2.VideoCapture(0)
hd = HandDetector(maxHands=1)
hd2 = HandDetector(maxHands=1)

count = len(oss.listdir(oss.path.join(DATA_ROOT, 'A')))
c_dir = 'A'

offset = 15
step = 1
flag=False
suv=0

white=np.ones((400,400),np.uint8)*255
cv2.imwrite("./white.jpg",white)


def _find_hands_normalized(detector, img, **kwargs):
    """Call detector.findHands and normalize the return value.

    Different versions of cvzone return either:
      - hands (list) ; or
      - (img, hands) ; or
      - (hands, img)

    This helper returns a tuple: (hands_list_or_None, image)
    """
    res = detector.findHands(img, **kwargs)
    hands = None
    out_img = img
    # normalize common return shapes
    if isinstance(res, tuple) or isinstance(res, list):
        if len(res) == 2:
            a, b = res[0], res[1]
            # prefer the element that is a list (hands)
            if isinstance(b, list):
                hands = b
                out_img = a if not isinstance(a, list) else img
            elif isinstance(a, list):
                hands = a
                out_img = b if not isinstance(b, list) else img
            else:
                # fallback: assume second is image
                hands = None
                out_img = b
        else:
            # unexpected sequence: assume it's a hands list
            hands = list(res)
            out_img = img
    else:
        # single value: could be hands list or image
        if isinstance(res, list):
            hands = res
        else:
            out_img = res

    return hands, out_img


while True:
    try:
        _, frame = capture.read()
        frame = cv2.flip(frame, 1)

        hands, frame = _find_hands_normalized(hd, frame, draw=False, flipType=True)
        white = cv2.imread("./white.jpg")

        if hands:
            hand = hands[0]
            # support both dict-style (cvzone>=X) and list-style return values
            if isinstance(hand, dict) and 'bbox' in hand:
                x, y, w, h = hand['bbox']
            elif isinstance(hand, (list, tuple)) and len(hand) >= 4:
                x, y, w, h = hand[0], hand[1], hand[2], hand[3]
            else:
                # unexpected format, skip this frame
                continue

            image = np.array(frame[y - offset:y + h + offset, x - offset:x + w + offset])

            handz, imz = _find_hands_normalized(hd2, image, draw=True, flipType=True)
            if handz:
                hand = handz[0]
                # landmark list may be under 'lmList' or be the hand itself
                if isinstance(hand, dict) and 'lmList' in hand:
                    pts = hand['lmList']
                elif isinstance(hand, (list, tuple)):
                    # try to find a list of 21 landmarks in nested structures
                    pts = None
                    for item in hand:
                        if isinstance(item, list) and len(item) == 21:
                            pts = item
                            break
                    if pts is None:
                        # fallback: try top-level hand assuming it's lmList
                        pts = hand
                else:
                    # can't extract landmarks, skip
                    continue

                os = ((400 - w) // 2) - 15
                os1 = ((400 - h) // 2) - 15
                for t in range(0, 4, 1):
                    cv2.line(white, (pts[t][0] + os, pts[t][1] + os1), (pts[t + 1][0] + os, pts[t + 1][1] + os1), (0, 255, 0), 3)
                for t in range(5, 8, 1):
                    cv2.line(white, (pts[t][0] + os, pts[t][1] + os1), (pts[t + 1][0] + os, pts[t + 1][1] + os1), (0, 255, 0), 3)
                for t in range(9, 12, 1):
                    cv2.line(white, (pts[t][0] + os, pts[t][1] + os1), (pts[t + 1][0] + os, pts[t + 1][1] + os1), (0, 255, 0), 3)
                for t in range(13, 16, 1):
                    cv2.line(white, (pts[t][0] + os, pts[t][1] + os1), (pts[t + 1][0] + os, pts[t + 1][1] + os1), (0, 255, 0), 3)
                for t in range(17, 20, 1):
                    cv2.line(white, (pts[t][0] + os, pts[t][1] + os1), (pts[t + 1][0] + os, pts[t + 1][1] + os1), (0, 255, 0), 3)
                cv2.line(white, (pts[5][0] + os, pts[5][1] + os1), (pts[9][0] + os, pts[9][1] + os1), (0, 255, 0), 3)
                cv2.line(white, (pts[9][0] + os, pts[9][1] + os1), (pts[13][0] + os, pts[13][1] + os1), (0, 255, 0), 3)
                cv2.line(white, (pts[13][0] + os, pts[13][1] + os1), (pts[17][0] + os, pts[17][1] + os1), (0, 255, 0), 3)
                cv2.line(white, (pts[0][0] + os, pts[0][1] + os1), (pts[5][0] + os, pts[5][1] + os1), (0, 255, 0), 3)
                cv2.line(white, (pts[0][0] + os, pts[0][1] + os1), (pts[17][0] + os, pts[17][1] + os1), (0, 255, 0), 3)

                skeleton0 = np.array(white)
                zz = np.array(white)
                for i in range(21):
                    cv2.circle(white, (pts[i][0] + os, pts[i][1] + os1), 2, (0, 0, 255), 1)

                skeleton1 = np.array(white)

                cv2.imshow("1", skeleton1)

        frame = cv2.putText(frame, "dir=" + str(c_dir) + "  count=" + str(count), (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            1, (255, 0, 0), 1, cv2.LINE_AA)
        cv2.imshow("frame", frame)
        interrupt = cv2.waitKey(1)
        if interrupt & 0xFF == 27:
            # esc key
            break


        if interrupt & 0xFF == ord('n'):
            c_dir = chr(ord(c_dir)+1)
            if ord(c_dir)==ord('Z')+1:
                c_dir='A'
            flag = False
            count = len(oss.listdir(oss.path.join(DATA_ROOT, c_dir)))

        if interrupt & 0xFF == ord('a'):
            if flag:
                flag=False
            else:
                suv=0
                flag=True

        print("=====",flag)
        if flag==True:

            if suv==180:
                flag=False
            if step%3==0:
                save_dir = oss.path.join(SAVE_ROOT, c_dir)
                oss.makedirs(save_dir, exist_ok=True)
                cv2.imwrite(oss.path.join(save_dir, str(count) + ".jpg"), skeleton1)

                count += 1
                suv += 1
            step+=1



    except Exception:
        print("==",traceback.format_exc() )

capture.release()
cv2.destroyAllWindows()