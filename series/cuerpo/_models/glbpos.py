import json,struct,numpy as np,sys
def load(path):
    b=open(path,'rb').read(); n=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+n]); bin0=20+n+8
    def pos(name):
        m=[x for x in j['meshes'] if x['name']==name][0]; a=j['accessors'][m['primitives'][0]['attributes']['POSITION']]
        bv=j['bufferViews'][a['bufferView']]; o=bin0+bv.get('byteOffset',0)+a.get('byteOffset',0)
        return np.frombuffer(b[o:o+a['count']*12],dtype='<f4').reshape(-1,3)
    return pos
