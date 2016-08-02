/**
 * **************************************************************************
 * VLCOptions.java
 * ****************************************************************************
 * Copyright © 2015 VLC authors and VideoLAN
 * <p/>
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * <p/>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
 * ***************************************************************************
 */

package org.videolan.vlc.util;

import org.videolan.libvlc.Media;

import java.util.ArrayList;


public class VLCOptions {

    public static final int HW_ACCELERATION_AUTOMATIC = -1;
    public static final int HW_ACCELERATION_DISABLED = 0;
    public static final int HW_ACCELERATION_DECODING = 1;
    public static final int HW_ACCELERATION_FULL = 2;

    public final static int MEDIA_NO_VIDEO = 0x01;
    public final static int MEDIA_NO_HWACCEL = 0x02;
    public final static int MEDIA_PAUSED = 0x4;

    public static ArrayList<String> getLibOptions() {
        ArrayList<String> options = new ArrayList<>(50);
        /* CPU intensive plugin, setting for slow devices */
        options.add("--no-audio-time-stretch");
        options.add("--avcodec-skiploopfilter");
        options.add("-1");
        options.add("--avcodec-skip-frame");
        options.add("0");
        options.add("--avcodec-skip-idct");
        options.add("0");
        options.add("--subsdec-encoding");
        options.add("");
        options.add("--stats");
        options.add("--androidwindow-chroma");
        options.add("RV32");
        options.add("-vvv");
        return options;
    }

    public static void setMediaOptions(Media media, int flags, int hardwareAcceleration) {
        boolean noHardwareAcceleration = (flags & MEDIA_NO_HWACCEL) != 0;
        boolean noVideo = (flags & MEDIA_NO_VIDEO) != 0;
        final boolean paused = (flags & MEDIA_PAUSED) != 0;
        int hw = HW_ACCELERATION_DISABLED;

        if (!noHardwareAcceleration) {
            hw = hardwareAcceleration;
        }
        if (hw == HW_ACCELERATION_DISABLED)
            media.setHWDecoderEnabled(false, false);
        else if (hw == HW_ACCELERATION_FULL || hw == HW_ACCELERATION_DECODING) {
            media.setHWDecoderEnabled(true, true);
            if (hw == HW_ACCELERATION_DECODING) {
                media.addOption(":no-mediacodec-dr");
                media.addOption(":no-omxil-dr");
            }
        } /* else automatic: use default options */

        if (noVideo)
            media.addOption(":no-video");
        if (paused)
            media.addOption(":start-paused");
    }
}
