package me.shinsunyoung.springbootdeveloper.config.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import me.shinsunyoung.springbootdeveloper.domain.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class TokenProvider {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecretKey().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user, Duration expiredAt) {
        Date now = new Date();
        return makeToken(new Date(now.getTime() + expiredAt.toMillis()), user);
    }

    private String makeToken(Date expiry, User user) {
        Date now = new Date();

        // 💡 유저가 가진 실제 권한 목록을 문자열 리스트로 변환하여 토큰에 저장합니다.
        List<String> roles = user.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.toList());

        return Jwts.builder()
                .header().add("typ", "JWT").and()
                .issuer(jwtProperties.getIssuer())
                .issuedAt(now)
                .expiration(expiry)
                .subject(user.getEmail())
                .claim("id", user.getId())
                .claim("roles", roles) // 💡 토큰에 권한 정보 추가
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = getClaims(token);
        
        // 💡 하드코딩 대신, 토큰(클레임)에서 권한 정보를 꺼내서 세팅합니다.
        List<String> roles = claims.get("roles", List.class);
        Set<SimpleGrantedAuthority> authorities = roles == null 
                ? Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")) // 기본값 방어 코드
                : roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toSet());

        return new UsernamePasswordAuthenticationToken(
                new org.springframework.security.core.userdetails.User(claims.getSubject(), "", authorities), 
                token, 
                authorities
        );
    }

    // 💡 원래 코드에서 누락되어 있던 복호화(Claims 추출) 메서드를 추가했습니다.
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload(); // 최신 버전에서는 getBody() 대신 getPayload()를 권장합니다.
    }
}