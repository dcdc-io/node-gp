using System;
using System.Linq;
using System.Collections.Generic;
using System.Security.Cryptography;
					
public class Program
{
	public static void Main()
	{
		Console.WriteLine("Hello World");
		var mac = Program.getCC_MACNbytes("7962D9ECE03D1ACD4C76089DCE131543", "72C29C2371CC9BDB65B779B8E8D37B29ECC154AA56A8799FAE2F498F76ED92F2", "000000000000");
		Console.Write(mac.Select(b=>b.ToString("x")).Aggregate((a,b)=>a+b));
	}
	
	public static byte[] StringToByteArray(string hex) {
		return Enumerable.Range(0, hex.Length)
                     .Where(x => x % 2 == 0)
                     .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                     .ToArray();
	}
	
	private static byte[] getCC_MACNbytes(string Key_MAC, string eIFDstr, string Init_Vec)
    {
		byte[] eIFD = StringToByteArray(eIFDstr);
        byte[] Kmac = StringToByteArray(Key_MAC);

        // Split the 16 byte MAC key into two keys
        byte[] key1 = new byte[8];
        Array.Copy(Kmac, 0, key1, 0, 8);
        byte[] key2 = new byte[8];
        Array.Copy(Kmac, 8, key2, 0, 8);

        DES des1 = DES.Create();
        des1.BlockSize = 64;
        des1.Key = key1;
        des1.Mode = CipherMode.CBC;
        des1.Padding = PaddingMode.None;
        des1.IV = new byte[8];

        DES des2 = DES.Create();
        des2.BlockSize = 64;
        des2.Key = key2;
        des2.Mode = CipherMode.CBC;
        des2.Padding = PaddingMode.None;
        des2.IV = new byte[8];

        // Padd the data with Padding Method 2 (Bit Padding)
        System.IO.MemoryStream out_Renamed = new System.IO.MemoryStream();
        out_Renamed.Write(eIFD, 0, eIFD.Length);
        out_Renamed.WriteByte((byte)(0x80));
        while (out_Renamed.Length % 8 != 0)
        {
            out_Renamed.WriteByte((byte)0x00);
        }
        byte[] eIfd_padded = out_Renamed.ToArray();
        int N_bytes = eIfd_padded.Length/8;  // Number of Bytes 

        byte[] d1 = new byte[8];
        byte[] dN = new byte[8];
        byte[] hN = new byte[8];
        byte[] intN = new byte[8];

        // MAC Algorithm 3
        // Initial Transformation 1
        Array.Copy(eIfd_padded, 0, d1, 0, 8);
        hN = des1.CreateEncryptor().TransformFinalBlock(d1, 0, 8);

        // Split the blocks
        // Iteration on the rest of blocks
        for (int j = 1; j<N_bytes; j++)
        {
            Array.Copy(eIfd_padded, (8*j), dN, 0, 8);
            // XOR
            for (int i = 0; i < 8; i++)
                intN[i] = (byte)(hN[i] ^ dN[i]);

            // Encrypt
            hN = des1.CreateEncryptor().TransformFinalBlock(intN, 0, 8);
        }

        // Output Transformation 3
        byte[] hNdecrypt = des2.CreateDecryptor().TransformFinalBlock(hN, 0, 8);
        byte[] mIfd = des1.CreateEncryptor().TransformFinalBlock(hNdecrypt, 0, 8);

        //  Get check Sum CC
        return mIfd;
    }
}